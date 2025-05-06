export const getModalContentStyle = (darkMode) => ({
  backgroundColor: darkMode ? 'var(--background-color-light)' : 'var(--background-color-light)',
  color: darkMode ? 'var(--text-color-primary)' : 'var(--text-color-primary)',
  boxShadow: 'var(--shadow-md)',
  borderColor: 'var(--border-color)',
  borderWidth: '1px',
  borderStyle: 'solid'
});

export const getInputStyle = (darkMode) => ({
  backgroundColor: darkMode ? 'var(--background-color-light)' : 'var(--background-color-light)',
  color: darkMode ? 'var(--text-color-primary)' : 'var(--text-color-primary)',
  borderColor: 'var(--border-color)'
});

export const getModalButtonStyle = (darkMode, isPrimary = true) => ({
  backgroundColor: isPrimary ? 'var(--primary-color)' : 'var(--background-color-dark)',
  color: isPrimary ? 'white' : 'var(--text-color-primary)',
  border: isPrimary ? 'none' : '1px solid var(--border-color)'
});
