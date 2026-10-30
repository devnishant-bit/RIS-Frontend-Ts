import styles from './WorklistPagination.module.css'

interface WorklistPaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function WorklistPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: WorklistPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalItems)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <footer className={styles.pagination}>
      <div className={styles.range} aria-live="polite">
        Showing <strong>{firstItem}–{lastItem}</strong> of <strong>{totalItems}</strong> studies
      </div>

      <nav className={styles.pageControls} aria-label="Worklist pages">
        <button
          aria-label="Previous page"
          className={styles.stepButton}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <span aria-hidden="true">‹</span>
          <span className={styles.stepText}>Previous</span>
        </button>

        <div className={styles.pageNumbers}>
          {pageNumbers.map((number) => (
            <button
              key={number}
              aria-current={number === page ? 'page' : undefined}
              aria-label={`Page ${number}`}
              className={number === page ? styles.currentPage : styles.pageButton}
              onClick={() => onPageChange(number)}
              type="button"
            >
              {number}
            </button>
          ))}
        </div>

        <button
          aria-label="Next page"
          className={styles.stepButton}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <span className={styles.stepText}>Next</span>
          <span aria-hidden="true">›</span>
        </button>
      </nav>

      <label className={styles.pageSize}>
        <span>Rows</span>
        <select
          aria-label="Rows per page"
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          value={pageSize}
        >
          {[5, 10, 20].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <span>per page</span>
      </label>
    </footer>
  )
}
