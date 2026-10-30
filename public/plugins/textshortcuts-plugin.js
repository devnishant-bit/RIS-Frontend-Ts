tinymce.PluginManager.add('textshortcuts', function (editor) {
  // Default shortcuts
  let shortcuts = {
    BL: 'Broken Ligament',
    BP: 'Blood Pressure'
  };

  // Replace only when Tab is pressed
  editor.on('keydown', function (e) {
    if (e.key === 'Tab' || e.key === ' ') {
      const rng = editor.selection.getRng();
      const node = rng.startContainer;

      if (node.nodeType === 3) {
        // Text node — extract text before caret
        const text = node.textContent;
        const caretPos = rng.startOffset;
        const beforeCaret = text.substring(0, caretPos);
        const match = beforeCaret.match(/(\S+)$/); // last word

        if (match) {
          const lastWord = match[1];

          if (shortcuts[lastWord]) {
            // Prevent default tab behavior
            e.preventDefault();

            const newText = beforeCaret.replace(/(\S+)$/, shortcuts[lastWord]);

            // Replace text in node
            node.textContent = newText + text.substring(caretPos);

            // Move cursor to end of replaced word
            const newRng = document.createRange();
            newRng.setStart(node, newText.length);
            newRng.setEnd(node, newText.length);
            editor.selection.setRng(newRng);
          }
        }
      }
    }
  });

  // Toolbar button to manage shortcuts
  editor.ui.registry.addButton('textshortcuts', {
    text: 'Shortcuts',
    tooltip: 'Manage Shortcuts',
    onAction: function () {
      const items = Object.entries(shortcuts).map(([abbr, full]) =>
        `<li><strong>${abbr}</strong> → ${full}</li>`).join('');

      editor.windowManager.open({
        title: 'Text Shortcuts',
        body: {
          type: 'panel',
          items: [
            { type: 'htmlpanel', html: `<ul>${items || '<em>No shortcuts yet</em>'}</ul>` },
            { type: 'input', name: 'key', label: 'Shortcut (e.g. BL)' },
            { type: 'input', name: 'value', label: 'Expansion (e.g. Broken Ligament)' }
          ]
        },
        buttons: [
          { type: 'submit', text: 'Add Shortcut' },
          { type: 'cancel', text: 'Close' }
        ],
        onSubmit(api) {
          const data = api.getData();
          if (data.key && data.value) {
            shortcuts[data.key] = data.value;
            api.close();
            editor.notificationManager.open({
              text: `Shortcut "${data.key}" → "${data.value}" added`,
              type: 'info',
              timeout: 2000
            });
          }
        }
      });
    }
  });

  return {
    getMetadata: () => ({
      name: 'Text Shortcuts Plugin',
    })
  };
});
