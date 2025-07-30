document.addEventListener('DOMContentLoaded', function() {
  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) {
    paymentSection.style.display = 'block';
  }
  function updateFreeUsesCounter() {
    const maxFreeUses = 20;
    const usageCount = parseInt(localStorage.getItem('usageCount') || '0', 10);
    const remaining = Math.max(maxFreeUses - usageCount, 0);
    let counterDiv = document.getElementById('freeUsesCounter');
    if (!counterDiv) {
      counterDiv = document.createElement('div');
      counterDiv.id = 'freeUsesCounter';
      counterDiv.style.marginTop = '0.5rem';
      if (paymentSection && paymentSection.parentNode) {
        paymentSection.parentNode.insertBefore(counterDiv, paymentSection.nextSibling);
      } else {
        document.body.insertBefore(counterDiv, document.body.firstChild);
      }
    }
    counterDiv.textContent = `${remaining} free use${remaining === 1 ? '' : 's'} remaining`;
  }
  updateFreeUsesCounter();
  setInterval(updateFreeUsesCounter, 2000);
});
