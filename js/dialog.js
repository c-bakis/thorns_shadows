

    const infoBtn = document.getElementById('info-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const infoOverlay = document.getElementById('info-overlay-dialog');

/**
 * Opens a dialog element if it exists and supports the showModal method.
 * @param {HTMLDialogElement} dialog
 */
function openDialog(dialog) {
    if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
    }
}

/**
 * Closes a dialog element if it exists and supports the close method.
 * @param {Event} event
 * @param {HTMLDialogElement} dialog
 */
function closeDialogOnClickOutside(event, dialog) {
  if (event.target === dialog) {
    closeDialog(dialog);
  }
}

/**
 * Closes a dialog element if it exists and supports the close method.
 * @param {HTMLDialogElement} dialog
 */
function closeDialog(dialog) {
  if (dialog && dialog.open) {
    dialog.close();
  }
}