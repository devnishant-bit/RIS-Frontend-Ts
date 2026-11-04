import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  FaCrown,
  FaImages,
  FaNotesMedical,
  FaSlidersH,
  FaTimes,
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Preferences.module.css';
import {
  fetchAvailableEditions,
  fetchModules,
  fetchPreferences,
  fetchProducts,
  fetchUserPreferenceRows,
  saveUserPreferences,
} from './Preferences.api';
import type { SavePreferenceItem } from './Preferences.api';
import {
  EDITION_PREFERENCE_NAME,
  KNOWN_OPTIONS_BY_NAME,
  LARGE_GROUP_THRESHOLD,
  MODALITY_DESCRIPTIONS,
  PLACEHOLDER_OPTIONS,
  PREFERENCE_TYPES,
  PREFERENCE_TYPE_BY_ID,
  SINGLE_SELECT_VALUES,
  formatDateForApi,
  getGroupTypeId,
  getParentId,
  getTypedConfig,
  getVisiblePrefs,
  isComboboxType,
  isOptionHolderType,
  isOptionPreference,
  parseUserPreferences,
  sameId,
} from './Preferences.utils';
import type {
  Id,
  ModuleItem,
  ModulePrefs,
  PrefEntry,
  PreferenceDef,
  Product,
  SelectedPreferences,
  TypedConfig,
} from './Preferences.utils';

export interface PreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Small presentational piece: one option inside a segmented choice group
// ---------------------------------------------------------------------------

interface ChoiceProps {
  type: 'checkbox' | 'radio';
  name?: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  premium?: boolean;
  disabled?: boolean;
}

function Choice({ type, name, label, checked, onChange, premium = false, disabled = false }: ChoiceProps) {
  return (
    <label
      className={`${styles.choice} ${checked ? styles.choiceOn : ''} ${
        disabled ? styles.choiceDisabled : ''
      }`}
    >
      <input
        type={type}
        name={name}
        className={styles.srOnly}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      {premium && <FaCrown className={styles.crownIcon} />}
      <span>{label}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Preferences({ isOpen, onClose }: PreferencesProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [modules, setModules] = useState<Record<string, ModuleItem[]>>({});
  const [preferences, setPreferences] = useState<Record<string, PreferenceDef[]>>({});
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  // Storage key for the user's saved values (getuserpreference returns ALL of
  // the user's preferences, so they live under ONE module key).
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<SelectedPreferences>({});
  // preferenceid -> option names found in the user's saved rows
  const [savedOptionsById, setSavedOptionsById] = useState<Record<string, string[]>>({});
  const [availableEditions, setAvailableEditions] = useState<string[]>([]);

  // ---------- data loading (runs each time the modal opens) ----------

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const userid = localStorage.getItem('userid');

    const load = async () => {
      fetchAvailableEditions(userid).then((editions) => {
        if (!cancelled && editions) setAvailableEditions(editions);
      });

      const productList = await fetchProducts();
      if (cancelled) return;
      setProducts(productList);
      if (productList.length === 0) return;
      setActiveProductId(productList[0].productid);

      const moduleLists = await Promise.all(productList.map((p) => fetchModules(p.productid)));
      if (cancelled) return;
      const modulesByProduct: Record<string, ModuleItem[]> = {};
      productList.forEach((p, i) => {
        modulesByProduct[p.productid] = moduleLists[i];
      });
      setModules(modulesByProduct);

      const allModules = moduleLists.flat();
      if (allModules.length === 0) return;
      const primaryModuleId = allModules[0].moduleid;
      setSelectedModule(primaryModuleId);

      // Saved values are parsed according to each preference's typeid, so the
      // definitions must be loaded first.
      const preferenceLists = await Promise.all(allModules.map((m) => fetchPreferences(m.moduleid)));
      if (cancelled) return;
      const prefsByModule: Record<string, PreferenceDef[]> = {};
      allModules.forEach((m, i) => {
        prefsByModule[m.moduleid] = preferenceLists[i];
      });
      setPreferences(prefsByModule);

      const rows = await fetchUserPreferenceRows(userid);
      if (cancelled || !rows) return;
      const parsed = parseUserPreferences(rows, preferenceLists.flat());
      setSavedOptionsById((prev) => ({ ...prev, ...parsed.savedOptionsById }));
      setSelectedPreferences((prev) => ({ ...prev, [primaryModuleId]: parsed.userPreferences }));
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // ---------- state helpers ----------

  const updatePrefs = (updater: (current: ModulePrefs) => ModulePrefs) => {
    const key = String(selectedModule);
    setSelectedPreferences((prev) => ({
      ...prev,
      [key]: updater(prev[key] || {}),
    }));
  };

  // Toggle one checkbox option: { [preferenceId]: { [option]: bool } }
  const handlePreferenceChange = (preferenceId: Id, option: string) => {
    updatePrefs((current) => ({
      ...current,
      [preferenceId]: {
        ...current[preferenceId],
        [option]: !(current[preferenceId]?.[option] || false),
      },
    }));
  };

  // Select All / Deselect All for a checkbox group
  const handleSelectAll = (preferenceId: Id, options: string[], checked: boolean) => {
    updatePrefs((current) => ({
      ...current,
      [preferenceId]: options.reduce<PrefEntry>(
        (acc, option) => {
          acc[option] = checked;
          return acc;
        },
        { ...current[preferenceId] }
      ),
    }));
  };

  // Radio-style: { [preferenceId]: { selected: option } }
  const handleSingleSelect = (preferenceId: Id, option: string) => {
    updatePrefs((current) => ({
      ...current,
      [preferenceId]: { selected: option },
    }));
  };

  // Period: click again to deselect
  const handlePeriodToggle = (preferenceId: Id, option: string) => {
    updatePrefs((current) => {
      const currentPreference = current[preferenceId] || {};
      return {
        ...current,
        [preferenceId]: {
          ...currentPreference,
          selected: currentPreference.selected === option ? null : option,
        },
      };
    });
  };

  const handleMultiSelect = (preferenceId: Id, options: string[], selectedValues: string[]) => {
    updatePrefs((current) => ({
      ...current,
      [preferenceId]: options.reduce<PrefEntry>((acc, option) => {
        acc[option] = selectedValues.includes(option);
        return acc;
      }, {}),
    }));
  };

  // `key` is 'selected' or 'value'. An empty input clears the entry.
  const handleTypedValueChange = (preferenceId: Id, key: 'selected' | 'value', value: string) => {
    updatePrefs((current) => ({
      ...current,
      [preferenceId]: value === '' ? {} : { [key]: value },
    }));
  };

  // On/off fallback. Existing rows may use 'true' or 'True'; keep whichever exists.
  const isSettingOn = (currentPrefs: ModulePrefs, preferenceId: Id) => {
    const pref = currentPrefs[preferenceId] || {};
    return Boolean(pref.true || pref.True);
  };

  const handleSettingToggle = (currentPrefs: ModulePrefs, preferenceId: Id) => {
    const pref = currentPrefs[preferenceId] || {};
    const key = pref.True !== undefined && pref.true === undefined ? 'True' : 'true';
    handlePreferenceChange(preferenceId, key);
  };

  // Options for a CHECKBOX / RADIO / COMBOBOX that has no child option rows:
  // the option names found in the user's saved rows, else the placeholder.
  const getSavedOptions = (preferenceId: Id): string[] => {
    const saved = savedOptionsById[String(preferenceId)] || [];
    const onlyPlaceholder = saved.every((o) => PLACEHOLDER_OPTIONS.includes(o));
    return saved.length === 0 || onlyPlaceholder ? PLACEHOLDER_OPTIONS : saved;
  };

  // known (hardcoded) options -> saved rows -> placeholder.
  const getOptionsFor = (preference: PreferenceDef): string[] =>
    KNOWN_OPTIONS_BY_NAME[preference.preferencename] || getSavedOptions(preference.preferenceid);

  // ---------- save ----------

  const handleSave = () => {
    const userId = localStorage.getItem('userid');
    const userid = parseInt(userId ?? '', 10);

    const preferenceArray: SavePreferenceItem[] = Object.values(selectedPreferences).flatMap(
      (modulePrefs) =>
        Object.entries(modulePrefs).flatMap(([preferenceId, options]): SavePreferenceItem[] => {
          // Skip entries where preferenceId is invalid or missing
          if (!preferenceId || isNaN(Number(preferenceId))) return [];
          const preferenceid = parseInt(preferenceId, 10);

          if (options.selected) {
            // Single-value preferences (Edition, Web View Format, ...)
            return [
              {
                preferencevalue: options.selected,
                preferenceid,
                userid,
                status: true,
                userstatus: true,
              },
            ];
          }
          if (options.value) {
            // Date preferences (Start Date, End Date)
            return [
              {
                preferencevalue: formatDateForApi(options.value),
                preferenceid,
                userid,
                status: true,
                userstatus: true,
              },
            ];
          }
          // Checkbox-style preferences (Modality, Status, Period)
          return Object.entries(options).map(([preferencevalue, status]) => ({
            preferencevalue,
            preferenceid,
            userid,
            status: status as boolean,
            userstatus: true,
          }));
        })
    );

    console.log('Sending preferences:', preferenceArray);

    if (preferenceArray.length === 0) {
      console.log('No preferences to save.');
      return;
    }

    saveUserPreferences(preferenceArray)
      .then((response) => {
        toast.success('Preferences Saved Successfully!');
        console.log('Preferences saved successfully:', response);
      })
      .catch((error) => {
        console.error('Error saving preferences:', error);
      });
  };

  // ---------- render helpers ----------

  const renderProductTabs = () => (
    <div className={styles.productTabs} role="tablist" aria-label="Product">
      {products.map((product) => {
        const isActive = product.productid === activeProductId;
        const Icon = product.productname === 'PACS' ? FaImages : FaNotesMedical;
        return (
          <button
            key={product.productid}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.productTab} ${isActive ? styles.productTabActive : ''}`}
            onClick={() => setActiveProductId(product.productid)}
          >
            <Icon className={styles.productTabIcon} />
            <span>{product.productname}</span>
          </button>
        );
      })}
    </div>
  );

  // Fallback for a preference with no known typeid.
  const renderSettingRow = (preference: PreferenceDef, currentPrefs: ModulePrefs) => {
    const id = preference.preferenceid;
    const disabled = false; // was: preference.active === false
    const on = isSettingOn(currentPrefs, id);
    return (
      <div key={id} className={`${styles.settingField} ${disabled ? styles.settingFieldDisabled : ''}`}>
        <span className={styles.settingFieldLabel}>{preference.preferencename}</span>
        <div className={styles.choiceGroup}>
          <Choice
            type="checkbox"
            label={on ? 'On' : 'Off'}
            checked={on}
            disabled={disabled}
            onChange={() => handleSettingToggle(currentPrefs, id)}
          />
        </div>
      </div>
    );
  };

  // Large checkbox group (modality): its own card, title + Select All / Deselect All + grid.
  const renderCheckboxGrid = (preference: PreferenceDef, options: string[], saved: PrefEntry) => {
    const id = preference.preferenceid;
    const disabled = false; // was: preference.active === false
    const activeProduct = products.find((p) => p.productid === activeProductId) || products[0];
    const title = activeProduct ? `${activeProduct.productname} Worklist` : preference.preferencename;

    return (
      <section
        key={id}
        className={`${styles.card} ${styles.modalityCard} ${disabled ? styles.settingFieldDisabled : ''}`}
      >
        <div className={styles.modalityHeader}>
          <div className={styles.modalityTitleGroup}>
            <h2 className={styles.cardTitle}>{title}</h2>
          </div>
          <div className={styles.quickActions}>
            <button
              type="button"
              disabled={disabled}
              className={styles.quickActionPrimary}
              onClick={() => handleSelectAll(id, options, true)}
            >
              Select All
            </button>
            <span className={styles.quickActionDivider}>|</span>
            <button
              type="button"
              disabled={disabled}
              className={styles.quickActionSecondary}
              onClick={() => handleSelectAll(id, options, false)}
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className={styles.modalityGrid}>
          {options.map((option) => (
            <label key={option} className={styles.modalityOption}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={Boolean(saved[option])}
                disabled={disabled}
                onChange={() => handlePreferenceChange(id, option)}
              />
              <div className={styles.modalityText}>
                <span className={styles.modalityCode}>{option}</span>
                {MODALITY_DESCRIPTIONS[option] && (
                  <span className={styles.modalityDesc}>{MODALITY_DESCRIPTIONS[option]}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>
    );
  };

  // Renders one preference according to its API typeid.
  const renderTypedControl = (
    preference: PreferenceDef,
    typedConfig: TypedConfig,
    currentPrefs: ModulePrefs
  ): ReactNode => {
    const id = preference.preferenceid;
    const disabled = false; // was: preference.active === false
    const saved: PrefEntry = currentPrefs[id] || {};
    const options = typedConfig.options || [];
    const disabledOptions = typedConfig.disabledOptions || [];
    const withAssigned = (option: string, isLocked: boolean) =>
      isLocked ? `${option} (Assigned)` : option;
    let control: ReactNode = null;

    switch (typedConfig.type) {
      case PREFERENCE_TYPES.CHECKBOX: {
        if (options.length > LARGE_GROUP_THRESHOLD) {
          return renderCheckboxGrid(preference, options, saved);
        }
        // Options that are all single-select values (e.g. Period) are stored as
        // { selected } and can be clicked again to deselect.
        const singleStyle =
          options.length > 0 && options.every((o) => SINGLE_SELECT_VALUES.includes(o));
        control = (
          <div className={styles.choiceGroup} role="group" aria-label={preference.preferencename}>
            {options.map((option) => (
              <Choice
                key={option}
                type="checkbox"
                label={option}
                checked={Boolean(saved[option]) || (singleStyle && saved.selected === option)}
                disabled={disabled}
                onChange={() =>
                  singleStyle ? handlePeriodToggle(id, option) : handlePreferenceChange(id, option)
                }
              />
            ))}
          </div>
        );
        break;
      }

      case PREFERENCE_TYPES.RADIO:
        control = (
          <div className={styles.choiceGroup} role="radiogroup" aria-label={preference.preferencename}>
            {options.map((option) => (
              <Choice
                key={option}
                type="radio"
                name={`pref-${id}`}
                label={option}
                checked={saved.selected === option}
                disabled={disabled}
                onChange={() => handleSingleSelect(id, option)}
              />
            ))}
          </div>
        );
        break;

      case PREFERENCE_TYPES.COMBOBOX_SINGLE:
        control = (
          <select
            className={styles.settingSelect}
            value={saved.selected || ''}
            disabled={disabled}
            onChange={(e) => handleSingleSelect(id, e.target.value)}
          >
            <option value="" disabled>
              Select...
            </option>
            {options.map((option) => {
              const locked = disabledOptions.includes(option);
              return (
                <option key={option} value={option} disabled={locked}>
                  {withAssigned(option, locked)}
                </option>
              );
            })}
          </select>
        );
        break;

      case PREFERENCE_TYPES.COMBOBOX_MULTI:
        control = (
          <select
            multiple
            className={styles.settingSelect}
            disabled={disabled}
            value={options.filter((option) => saved[option])}
            onChange={(e) =>
              handleMultiSelect(
                id,
                options,
                Array.from(e.target.selectedOptions).map((o) => o.value)
              )
            }
          >
            {options.map((option) => {
              const locked = disabledOptions.includes(option) && !saved[option];
              return (
                <option key={option} value={option} disabled={locked}>
                  {withAssigned(option, locked)}
                </option>
              );
            })}
          </select>
        );
        break;

      case PREFERENCE_TYPES.TEXTBOX_NUMBER:
      case PREFERENCE_TYPES.TEXTBOX_STRING:
      case PREFERENCE_TYPES.DATETIME:
      case PREFERENCE_TYPES.TIME: {
        const inputType = {
          [PREFERENCE_TYPES.TEXTBOX_NUMBER]: 'number',
          [PREFERENCE_TYPES.TEXTBOX_STRING]: 'text',
          [PREFERENCE_TYPES.DATETIME]: 'datetime-local',
          [PREFERENCE_TYPES.TIME]: 'time',
        }[typedConfig.type];
        control = (
          <input
            type={inputType}
            className={styles.settingInput}
            disabled={disabled}
            value={saved.selected ?? ''}
            onChange={(e) => handleTypedValueChange(id, 'selected', e.target.value)}
          />
        );
        break;
      }

      case PREFERENCE_TYPES.DATE:
        control = (
          <input
            type="date"
            className={styles.settingInput}
            disabled={disabled}
            value={saved.value ?? ''}
            onChange={(e) => handleTypedValueChange(id, 'value', e.target.value)}
          />
        );
        break;

      case PREFERENCE_TYPES.TEXT_STRING:
      case PREFERENCE_TYPES.TEXT_NUMBER:
        return (
          <div key={id} className={styles.settingField}>
            <span className={styles.settingFieldLabel}>{preference.preferencename}</span>
          </div>
        );

      default:
        return renderSettingRow(preference, currentPrefs);
    }

    return (
      <div key={id} className={`${styles.settingField} ${disabled ? styles.settingFieldDisabled : ''}`}>
        <span className={styles.settingFieldLabel}>{preference.preferencename}</span>
        {control}
      </div>
    );
  };

  // Typed control when the typeid is known, otherwise the plain on/off row.
  const renderPreferenceControl = (preference: PreferenceDef, currentPrefs: ModulePrefs) => {
    const typedConfig = getTypedConfig(preference);
    if (!typedConfig) return renderSettingRow(preference, currentPrefs);
    const options = isOptionHolderType(typedConfig.type) ? getOptionsFor(preference) : [];
    return renderTypedControl(preference, { ...typedConfig, options }, currentPrefs);
  };

  const renderEditionRow = (editionPref: PreferenceDef, currentPrefs: ModulePrefs) => {
    const id = editionPref.preferenceid;
    const disabled = false; // was: editionPref.active === false
    return (
      <div
        key={id}
        className={`${styles.settingField} ${styles.settingFieldFeatured} ${
          disabled ? styles.settingFieldDisabled : ''
        }`}
      >
        <span className={styles.settingFieldLabel}>{editionPref.preferencename}</span>
        <div className={styles.choiceGroup} role="radiogroup" aria-label="Edition">
          {availableEditions.map((option) => (
            <Choice
              key={option}
              type="radio"
              name={`edition-${selectedModule}-${id}`}
              label={option}
              premium={option === 'Premium'}
              checked={currentPrefs[id]?.selected === option}
              disabled={disabled}
              onChange={() => handleSingleSelect(id, option)}
            />
          ))}
        </div>
      </div>
    );
  };

  // One list for the whole product: Edition first, then every preference laid
  // out purely from typeid / parentid.
  const renderSettings = (activePrefs: PreferenceDef[], currentPrefs: ModulePrefs) => {
    const editionPref = activePrefs.find((p) => p.preferencename === EDITION_PREFERENCE_NAME);
    const others = activePrefs.filter((p) => p.preferencename !== EDITION_PREFERENCE_NAME);

    const childrenOf = (preference: PreferenceDef) =>
      others.filter((p) => sameId(getParentId(p), preference.preferenceid));

    // A preference whose parent is missing is treated as top-level so it can't
    // silently disappear. Option rows (10/11) are never top-level.
    const topLevel = others.filter((p) => {
      if (isOptionPreference(p)) return false;
      const pid = getParentId(p);
      return !pid || !others.some((o) => sameId(o.preferenceid, pid));
    });

    if (topLevel.length === 0 && !editionPref) {
      return <div className={styles.emptyState}>No preferences found</div>;
    }

    // Full-width checkbox grids (e.g. modality) go in the right column, so the
    // small tiles (Start Date, End Date, ...) stay together on the left.
    const isWideNode = (preference: PreferenceDef) => {
      const typedConfig = getTypedConfig(preference);
      if (!typedConfig || typedConfig.type !== PREFERENCE_TYPES.CHECKBOX) return false;
      const children = childrenOf(preference);
      if (children.length > 0) {
        return children.every(isOptionPreference) && children.length > LARGE_GROUP_THRESHOLD;
      }
      return getOptionsFor(preference).length > LARGE_GROUP_THRESHOLD;
    };
    const leftNodes = topLevel.filter((p) => !isWideNode(p));
    const rightNodes = topLevel.filter((p) => isWideNode(p));
    const hasRight = rightNodes.length > 0;

    const renderNode = (preference: PreferenceDef, depth = 0): ReactNode => {
      const children = childrenOf(preference);
      const typedConfig = getTypedConfig(preference);

      // Option-holding type whose children are all type 10/11: the children ARE
      // its options, so render ONE control instead of a group.
      if (
        typedConfig &&
        isOptionHolderType(typedConfig.type) &&
        children.length > 0 &&
        children.every(isOptionPreference)
      ) {
        let takenByPeers: string[] = [];
        if (isComboboxType(typedConfig.type)) {
          const parentId = getParentId(preference);
          const groupId = getGroupTypeId(preference);
          const peers =
            parentId == null
              ? []
              : others.filter(
                  (p) =>
                    !sameId(p.preferenceid, preference.preferenceid) &&
                    sameId(getParentId(p), parentId) &&
                    getGroupTypeId(p) === groupId &&
                    isComboboxType(PREFERENCE_TYPE_BY_ID[p.typeid])
                );
          takenByPeers = peers
            .flatMap((p) => {
              const saved = currentPrefs[p.preferenceid] || {};
              return saved.selected != null
                ? [saved.selected]
                : Object.keys(saved).filter((k) => saved[k]);
            })
            .filter((name) => name !== 'None');
        }
        return renderTypedControl(
          preference,
          {
            ...typedConfig,
            options: children.map((c) => c.preferencename),
            disabledOptions: takenByPeers,
          },
          currentPrefs
        );
      }

      if (children.length === 0) {
        return renderPreferenceControl(preference, currentPrefs);
      }

      const hasGroupChildren = children.some((c) => childrenOf(c).length > 0);
      return (
        <div
          key={preference.preferenceid}
          className={`${styles.settingGroup} ${depth > 0 ? styles.settingGroupNested : ''}`}
        >
          <div className={styles.settingGroupHeader}>{preference.preferencename}</div>
          <div
            className={`${styles.settingGroupBody} ${
              hasGroupChildren ? styles.settingGroupBodyGroups : ''
            }`}
          >
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        </div>
      );
    };

    return (
      <div className={`${styles.settingsSplit} ${hasRight ? '' : styles.settingsSplitSingle}`}>
        {/* LEFT: Settings card (Edition + regular settings / groups) */}
        <section className={`${styles.card} ${styles.cardFill}`}>
          <div className={styles.cardHeader}>
            <FaSlidersH className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Settings</h2>
          </div>
          <div className={styles.settingsList}>
            {editionPref && renderEditionRow(editionPref, currentPrefs)}
            {leftNodes.map((p) => renderNode(p, 0))}
          </div>
        </section>

        {/* RIGHT: Worklist card(s) */}
        {hasRight && (
          <div className={styles.settingsRight}>{rightNodes.map((p) => renderNode(p, 0))}</div>
        )}
      </div>
    );
  };

  const renderBody = () => {
    if (products.length === 0) {
      return <div className={styles.emptyState}>No products found</div>;
    }

    const activeProduct = products.find((p) => p.productid === activeProductId) || products[0];
    const activeModuleIds = (modules[activeProduct.productid] || []).map((m) => m.moduleid);
    const activePrefs = getVisiblePrefs(activeModuleIds.flatMap((id) => preferences[id] || []));
    const currentPrefs = selectedPreferences[String(selectedModule)] || {};

    return (
      <div>
        {renderProductTabs()}
        <div className={styles.grid}>
          <div className={`${styles.column} ${styles.columnFull}`}>
            {renderSettings(activePrefs, currentPrefs)}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="User Preferences">
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>User Preferences</h1>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            className={styles.closeIconButton}
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </header>

        <main className={styles.body}>{renderBody()}</main>

        <footer className={styles.footer}>
          <div className={styles.footerActions}>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              Close
            </button>
            <button type="button" className={styles.saveButton} onClick={handleSave}>
              <span>Save</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}