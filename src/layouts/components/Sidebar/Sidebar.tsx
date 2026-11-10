import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './icons';
import { defaultSidebarMenu } from './menuItems';
import type { SidebarNode } from './menuItems';
import styles from './Sidebar.module.css';
// import { createPortal } from 'react-dom';
// import Preferences from '../../../features/Preferences/Preferences';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { routePaths } from '@/routes/routePaths';

export const DESKTOP_QUERY = '(min-width: 1024px)';

export type SidebarTheme = 'light' | 'dark';

export interface SidebarUser {
  name: string;
  role: string;
  email?: string;
  initials?: string;
}

export interface SidebarNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  category?: string;
}

export interface SidebarProps {
  /** Controlled by the parent so it can follow the app theme. */
  theme?: SidebarTheme;
  /** When provided, a theme toggle button is shown in the footer. */
  onToggleTheme?: () => void;
  user: SidebarUser;
  notifications?: SidebarNotification[];
  menu?: SidebarNode[];
  onLogout?: () => void;
  /** Lets the application shell resize its grid track with the sidebar. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

type Popover = 'profile' | 'notifications' | null;

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(' ');

const isPathActive = (to: string, pathname: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

const hasActiveDescendant = (node: SidebarNode, pathname: string): boolean =>
  node.kind === 'link'
    ? isPathActive(node.to, pathname)
    : node.children.some((child) => hasActiveDescendant(child, pathname));

/** Keys of every branch on the path to the current route, so deep links open expanded. */
const collectActiveBranchKeys = (
  nodes: SidebarNode[],
  pathname: string,
  parentKey = '',
): string[] =>
  nodes.flatMap((node) => {
    if (node.kind === 'link') return [];
    const key = `${parentKey}/${node.label}`;
    return hasActiveDescendant(node, pathname)
      ? [key, ...collectActiveBranchKeys(node.children, pathname, key)]
      : [];
  });

const getInitials = (user: SidebarUser) =>
  user.initials ??
  user.name
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

type Bar = { top: number; height: number; left: number; visible: boolean };
const EMPTY_BARS: Bar[] = [0, 1, 2].map(() => ({ top: 0, height: 0, left: 0, visible: false }));

function SidebarInner({
  theme = 'light',
  onToggleTheme,
  user,
  notifications = [],
  menu = defaultSidebarMenu,
  onLogout,
  onCollapsedChange,
}: SidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Starts collapsed on small screens, where the sidebar becomes a top panel.
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  );
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(collectActiveBranchKeys(menu, pathname).map((key) => [key, true])),
  );
  const [popover, setPopover] = useState<Popover>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const navRef = useRef<HTMLElement>(null);
  const [bars, setBars] = useState<Bar[]>(EMPTY_BARS);

  const [prefsOpen, setPrefsOpen] = useState(false);

  // Collapse branches that don't contain the current page whenever the route changes.;
  useEffect(() => {
    setOpenKeys(
      Object.fromEntries(collectActiveBranchKeys(menu, pathname).map((key) => [key, true])),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Measures the highlighted row at each level and positions its indicator bar.
  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const navRect = nav.getBoundingClientRect();
    setBars((prev) => {
      const next = [0, 1, 2].map((level): Bar => {
        const rows = Array.from(
          nav.querySelectorAll<HTMLElement>(`[data-level="${level}"][data-hl="true"]`),
        );
        const row = rows.find((r) => r.dataset.current === 'true') ?? rows[rows.length - 1];
        if (!row) return { ...prev[level], visible: false };
        const rowRect = row.getBoundingClientRect();
        const itemRect = (row.parentElement ?? row).getBoundingClientRect(); // <li> has no hover transform
        const inset = level === 0 ? 8 : 0;
        return {
          top: rowRect.top - navRect.top + inset,
          height: rowRect.height - inset * 2,
          left: itemRect.left - navRect.left + (level === 0 ? -1 : -9),
          visible: true,
        };
      });
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, pathname, openKeys, collapsed, theme]);

  // The accordion animates the nav's height, so re-measure on every frame of it.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  // Close the profile / notification popovers on outside click or Escape.
  useEffect(() => {
    if (!popover) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setPopover(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPopover(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [popover]);

  const toggleCollapsed = () => {
    setPopover(null);
    setCollapsed((value) => !value);
  };

  const toggleBranch = (key: string, depth: number) => {
    // In the icon rail, a root branch first expands the sidebar and opens itself.
    if (collapsed && depth === 0) {
      setCollapsed(false);
      setOpenKeys((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderNodes = (nodes: SidebarNode[], depth: number, parentKey: string) => (
    <ul className={cx(styles.list, depth > 0 && styles.children)}>
      {nodes.map((node) => {
        const key = `${parentKey}/${node.label}`;
        const depthClass = depth === 0 ? styles.root : depth === 1 ? styles.sub : styles.leaf;

        const rowMain = (
          <span className={styles.rowMain}>
            {node.icon && <Icon name={node.icon} className={styles.icon} />}
            <span className={styles.label}>{node.label}</span>
          </span>
        );

        if (node.kind === 'link') {
          const linkActive = isPathActive(node.to, pathname);
          return (
            <li key={key}>
              <NavLink
                to={node.to}
                data-tooltip={node.label}
                data-level={Math.min(depth, 2)}
                data-hl={linkActive}
                data-current={linkActive}
                className={({ isActive }) => cx(styles.row, depthClass, isActive && styles.active)}
              >
                {rowMain}
              </NavLink>
            </li>
          );
        }

        const isOpen = Boolean(openKeys[key]);
        const containsActive = hasActiveDescendant(node, pathname);
        const highlighted = isOpen || containsActive;
        const panelId = `sidebar-panel-${key.replace(/[^a-zA-Z0-9]+/g, '-')}`;

        return (
          <li key={key}>
            <button
              type="button"
              data-tooltip={node.label}
              data-level={Math.min(depth, 2)}
              data-hl={highlighted}
              data-current={containsActive}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleBranch(key, depth)}
              className={cx(
                styles.row,
                depthClass,
                highlighted && (depth === 0 ? styles.active : styles.activeParent),
              )}
            >
              {rowMain}
              <Icon
                name="chevronRight"
                className={cx(styles.chevron, isOpen && styles.chevronOpen)}
              />
            </button>
            <div id={panelId} className={cx(styles.collapse, isOpen && styles.collapseOpen)} inert={!isOpen}>
              <div className={styles.collapseInner}>
                {renderNodes(node.children, depth + 1, key)}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={cx(styles.sidebar, collapsed ? styles.collapsed : styles.expanded)}
      data-theme={theme}
      aria-label="Primary"
    >
      <div className={styles.topBar}>
        <span className={styles.sectionLabel}>Navigation</span>
        <button
          type="button"
          className={styles.iconButton}
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="menu" className={styles.iconButtonSvg} />
        </button>
      </div>

      <div className={styles.scroll}>
        {/* Profile + notifications */}
        <div className={styles.header} ref={headerRef}>
          <div className={styles.profileRow}>
            <button
              type="button"
              className={styles.profileButton}
              data-tooltip={user.name}
              aria-haspopup="menu"
              aria-expanded={popover === 'profile'}
              onClick={() => setPopover((value) => (value === 'profile' ? null : 'profile'))}
            >
              <span className={styles.profileMain}>
                <span className={styles.avatarWrap}>
                  <span className={styles.avatar}>{getInitials(user)}</span>
                  <span className={styles.statusDot} />
                </span>
                <span className={cx(styles.label, styles.profileText)}>
                  <span className={styles.profileName}>{user.name}</span>
                  <span className={styles.profileRole}>{user.role}</span>
                </span>
              </span>
              <Icon
                name="chevronDown"
                className={cx(styles.profileChevron, popover === 'profile' && styles.flip)}
              />
            </button>

            <button
              type="button"
              className={styles.notifButton}
              data-tooltip="Notifications"
              aria-label={`Notifications${notifications.length ? `, ${notifications.length} new` : ''}`}
              aria-haspopup="true"
              aria-expanded={popover === 'notifications'}
              onClick={() =>
                setPopover((value) => (value === 'notifications' ? null : 'notifications'))
              }
            >
              <Icon name="bell" className={styles.notifIcon} />
              {notifications.length > 0 && (
                <span className={styles.badge}>{notifications.length}</span>
              )}
            </button>
          </div>

          {popover === 'profile' && (
            <div className={styles.popover} role="menu">
              <div className={styles.popoverHead}>
                <p className={styles.popoverTitle}>{user.name}</p>
                {user.email && <p className={styles.popoverSub}>{user.email}</p>}
              </div>
              <div className={styles.popoverBody}>
                <button type="button" role="menuitem" className={styles.popoverItem}>
                  Doctor Profile
                </button>
                {/* TEMP: Profile-menu shortcut to the existing scheduling page. */}
                <button
                  type="button"
                  role="menuitem"
                  className={styles.popoverItem}
                  onClick={() => {
                    setPopover(null);
                    navigate(routePaths.scheduling);
                  }}
                >
                  Clinical Schedule
                </button>
                <button type="button" role="menuitem" className={styles.popoverItem} onClick={() => {
                    setPopover(null);
                    setPrefsOpen(true);
                  }}>
                  Preferences
                </button>
                {onToggleTheme && (
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(styles.popoverItem, styles.popoverItemIcon)}
                    onClick={onToggleTheme}
                  >
                    <Icon name={theme === 'dark' ? 'sun' : 'moon'} className={styles.popoverIcon} />
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                )}
              </div>
              <div className={styles.popoverFoot}>
                <button
                  type="button"
                  role="menuitem"
                  className={cx(styles.popoverItem, styles.popoverDanger)}
                  onClick={onLogout}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {popover === 'notifications' && (
            <div className={styles.popover}>
              <div className={styles.notifHead}>
                <span className={styles.notifHeadTitle}>Clinical alerts</span>
                {notifications.length > 0 && (
                  <span className={styles.notifCount}>{notifications.length} new</span>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className={styles.notifEmpty}>No new alerts.</p>
              ) : (
                <ul className={styles.notifList}>
                  {notifications.map((item) => (
                    <li key={item.id} className={styles.notifItem}>
                      <div className={styles.notifMeta}>
                        <span className={styles.notifCategory}>{item.category ?? 'Alert'}</span>
                        <span className={styles.notifTime}>{item.time}</span>
                      </div>
                      <p className={styles.notifTitle}>{item.title}</p>
                      <p className={styles.notifMessage}>{item.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className={cx(styles.menuLabel)}>
          <span>Menu</span>
        </div>

        <nav className={styles.nav} ref={navRef} aria-label="Main menu">
          {renderNodes(menu, 0, '')}
          {bars.map((bar, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cx(
                styles.indicator,
                i === 0 ? styles.indicatorRoot : styles.indicatorNested,
                bar.visible && styles.indicatorVisible,
              )}
              style={{ top: bar.top, height: bar.height, left: bar.left }}
            />
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        {/* {onToggleTheme && (
          <button
            type="button"
            className={cx(styles.footerButton, styles.themeButton)}
            data-tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            onClick={onToggleTheme}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className={styles.footerIcon} />
            <span className={styles.label}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        )} */}

        <button
          type="button"
          className={cx(styles.footerButton, styles.logout)}
          data-tooltip="Logout"
          onClick={onLogout}
        >
          <Icon name="logout" className={styles.footerIcon} />
          <span className={styles.label}>Logout</span>
        </button>

        <div className={styles.brand} title="Teciatric Informatics">
          <span className={styles.brandMark}>ti</span>
          <span className={cx(styles.label, styles.brandText)}>
            <span className={styles.brandName}>Teciatric</span>
            <span className={styles.brandSub}>Informatics</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
export default function Sidebar(props: SidebarProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;
  return <SidebarInner {...props} />;
}
