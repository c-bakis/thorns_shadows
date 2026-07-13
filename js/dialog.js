

    const infoBtn = document.getElementById('info-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const infoOverlay = document.getElementById('info-overlay-dialog');


function openDialog(dialog) {
    if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
    }
}

// Check if the click is outside the dialog content
function closeDialogOnClickOutside(event, dialog) {
  if (event.target === dialog) {
    closeDialog(dialog);
  }
}

// Check if the dialog is open before trying to close it
function closeDialog(dialog) {
  if (dialog && dialog.open) {
    dialog.close();
  }
}