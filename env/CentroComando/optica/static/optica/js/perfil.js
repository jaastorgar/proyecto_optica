document.addEventListener('click', function(event) {
    if (event.target.getAttribute('data-action') === 'toggle-profile') {
        event.preventDefault();
        const updateProfileForm = document.getElementById('updateFormSection');
        if (updateProfileForm.style.display === 'none') {
            updateProfileForm.style.display = 'block';
            event.target.textContent = 'Ocultar Formulario';
        } else {
            updateProfileForm.style.display = 'none';
            event.target.textContent = 'Actualizar Información';
        }
    }
});