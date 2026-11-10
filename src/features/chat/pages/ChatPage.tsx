import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdEdit, MdSearch } from 'react-icons/md';
import { useAuth } from '@/shared/auth/useAuth';
import { useChatContext } from '../ChatProvider';
import { avatarTone, formatListTime, formatTime, getInitials } from '../utils';
import styles from './ChatPage.module.css';

const cx = (...names: Array<string | false | undefined | null>) => names.filter(Boolean).join(' ');

export function ChatPage() {
  const { user } = useAuth();
  const myId = Number(user?.id); // same field used in ChatProviders
  const myInitials = getInitials(user?.displayName ?? 'You');
  const chat = useChatContext();

  const [filter, setFilter] = useState('');
  const [input, setInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const conversations = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return Object.values(chat.conversations)
      .map((c) => ({
        ...c,
        last: c.messages[c.messages.length - 1]
      }))
      .filter((c) => c.name.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          (b.last ? Date.parse(b.last.timestamp) : 0) - (a.last ? Date.parse(a.last.timestamp) : 0),
      );
  }, [chat.conversations, filter, myId]);

  const contacts = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    return chat.doctors
      .map((d) => ({ id: Number(d.userid), name: `${d.fname} ${d.lname}`.trim() }))
      .filter((c) => c.name.toLowerCase().includes(q));
  }, [chat.doctors, contactQuery]);

  const active = chat.activeChatId != null ? chat.conversations[chat.activeChatId] : undefined;
  const messages = active?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, chat.activeChatId]);

  useEffect(() => {
    if (chat.activeChatId != null) inputRef.current?.focus();
  }, [chat.activeChatId]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  const resizeInput = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleSend = () => {
    if (!chat.send(input)) return;
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const pickContact = (id: number) => {
    setModalOpen(false);
    setContactQuery('');
    chat.openChat(id);
  };

  return (
    <div className={styles.page}>
      {/* LEFT: conversations */}
      <aside className={styles.pane + ' ' + styles.people}>
        <div className={styles.peopleHead}>
          <div className={styles.peopleTitleRow}>
            <span className={styles.paneTitle}>Messages</span>
            <button type="button" className={styles.newChat} onClick={() => setModalOpen(true)}>
              <MdEdit size={16} />
              New Chat
            </button>
          </div>
          <div className={styles.searchBox}>
            <MdSearch size={18} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search messages..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <ul className={styles.list}>
          {conversations.length === 0 && (
            <li className={styles.listEmpty}>
              {filter ? 'No matching conversations.' : 'No conversations yet. Click New Chat to start one.'}
            </li>
          )}
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={cx(styles.person, c.id === chat.activeChatId && styles.personActive)}
                onClick={() => chat.openChat(c.id)}
              >
                <span className={cx(styles.avatar, styles[`tone${avatarTone(c.id)}`])}>
                  {getInitials(c.name)}
                </span>
                <span className={styles.personText}>
                  <span className={styles.personTop}>
                    <span className={cx(styles.personName, c.unread > 0 && styles.strong)}>{c.name}</span>
                    {c.last && (
                      <span className={cx(styles.personTime, c.unread > 0 && styles.timeUnread)}>
                        {formatListTime(c.last.timestamp)}
                      </span>
                    )}
                  </span>
                  <span className={styles.personBottom}>
                    <span className={cx(styles.preview, c.unread > 0 && styles.previewUnread)}>
                      {c.last ? c.last.text : 'No messages yet'}
                    </span>
                    {c.unread > 0 && <span className={styles.badge}>{c.unread}</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* RIGHT: thread */}
      <section className={styles.pane + ' ' + styles.thread}>
        {!active ? (
          <div className={styles.emptyThread}>
            <div className={styles.emptyIcon}>
              <MdEdit size={26} />
            </div>
            <h3 className={styles.emptyTitle}>Select a conversation</h3>
            <p className={styles.emptyText}>Pick one from the list, or start a new chat.</p>
          </div>
        ) : (
          <>
            <header className={styles.threadHead}>
              <span className={cx(styles.avatar, styles.avatarLg, styles[`tone${avatarTone(active.id)}`])}>
                {getInitials(active.name)}
              </span>
              <div className={styles.threadHeadText}>
                <span className={styles.threadName}>{active.name}</span>
                {!chat.connected && <span className={styles.offline}>Reconnecting...</span>}
              </div>
            </header>

            <div className={styles.messages}>
              {messages.length === 0 && (
                <div className={styles.beginning}>
                  <span className={cx(styles.avatar, styles.avatarXl, styles[`tone${avatarTone(active.id)}`])}>
                    {getInitials(active.name)}
                  </span>
                  <h3 className={styles.emptyTitle}>{active.name}</h3>
                  <p className={styles.emptyText}>This is the beginning of your conversation with {active.name}.</p>
                </div>
              )}

              {messages.map((m) => {
                const mine = m.senderid === myId;
                return (
                  <div key={m.id} className={cx(styles.row, mine && styles.rowMine)}>
                    {!mine && (
                      <span className={cx(styles.avatar, styles.avatarSm, styles[`tone${avatarTone(active.id)}`])}>
                        {getInitials(active.name)}
                      </span>
                    )}
                    <div className={cx(styles.col, mine && styles.colMine)}>
                      <div className={styles.meta}>
                        {mine ? (
                          <>
                            <span className={styles.time}>{formatTime(m.timestamp)}</span>
                            <span className={styles.youName}>You</span>
                          </>
                        ) : (
                          <>
                            <span className={styles.senderName}>{active.name}</span>
                            <span className={styles.time}>{formatTime(m.timestamp)}</span>
                          </>
                        )}
                      </div>
                      <div className={cx(styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs)}>
                        {m.text}
                      </div>
                    </div>
                    {mine && <span className={cx(styles.avatar, styles.avatarSm, styles.avatarSelf)}>{myInitials}</span>}
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {chat.sendError && (
              <div className={styles.sendError} role="alert">{chat.sendError}</div>
            )}

            <div className={styles.composer}>
              <div className={styles.composerBox}>
                <textarea
                  ref={inputRef}
                  className={styles.textarea}
                  rows={1}
                  maxLength={5000}
                  value={input}
                  disabled={!chat.connected}
                  placeholder={chat.connected ? 'Type a message...' : 'Reconnecting...'}
                  onChange={(e) => {
                    setInput(e.target.value);
                    resizeInput(e.target);
                  }}
                  onKeyDown={handleKeyDown}
                />
                <button type="button" className={styles.send} onClick={handleSend} disabled={!chat.connected || !input.trim()}>
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* New chat modal */}
      {modalOpen &&
        createPortal(
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="newChatTitle"
            onMouseDown={(e) => e.target === e.currentTarget && setModalOpen(false)}
          >
            <div className={styles.modal}>
              <div className={styles.modalHead}>
                <div>
                  <h2 id="newChatTitle" className={styles.modalTitle}>Start New Conversation</h2>
                  <p className={styles.modalSub}>Select a person to begin direct messaging</p>
                </div>
                <button type="button" className={styles.closeBtn} aria-label="Close dialog" onClick={() => setModalOpen(false)}>
                  <MdClose size={20} />
                </button>
              </div>

              <div className={styles.modalSearch}>
                <div className={styles.searchBox}>
                  <MdSearch size={18} className={styles.searchIcon} />
                  <input
                    autoFocus
                    autoComplete="off"
                    className={styles.searchInput}
                    placeholder="Search people by name..."
                    value={contactQuery}
                    onChange={(e) => setContactQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.contacts}>
                {contacts.length === 0 && <div className={styles.listEmpty}>No reachable contacts found</div>}
                {contacts.map((c) => (
                  <button key={c.id} type="button" className={styles.contact} onClick={() => pickContact(c.id)}>
                    <span className={cx(styles.avatar, styles[`tone${avatarTone(c.id)}`])}>{getInitials(c.name)}</span>
                    <span className={styles.contactName}>{c.name}</span>
                  </button>
                ))}
              </div>

              <div className={styles.modalFoot}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}