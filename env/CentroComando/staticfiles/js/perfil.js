document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    const toggleButton = document.getElementById('toggleUpdateProfileForm');
    const updateFormSection = document.getElementById('updateFormSection');

    console.log('Toggle button:', toggleButton);
    console.log('Update form section:', updateFormSection);

    if (toggleButton && updateFormSection) {
        toggleButton.addEventListener('click', function() {
            console.log('Button clicked');
            updateFormSection.style.display = updateFormSection.style.display === 'none' ? 'block' : 'none';
        });
    }
});