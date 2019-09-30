const addBtn = [...document.querySelectorAll('.add-button')];
addBtn.forEach(btn => {
    btn.style.display = 'none';
});

if ('serviceWorker' in navigator) {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', e => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        addBtn.forEach(btn => {
            if (btn !== undefined) btn.style.display = 'block';
        });
    });

    addBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            // hide our user interface that shows our A2HS button
            addBtn.forEach(btn => {
                if (btn !== undefined) btn.style.display = 'none';
            });

            // Show the prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }

                deferredPrompt = null;
            });
        });
    });
}