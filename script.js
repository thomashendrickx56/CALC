const SECRET_CODE = '67676767';

const display = document.getElementById('display');
const buttons = document.querySelector('.buttons');

const functionMap = {
  sin: 'Math.sin(',
  cos: 'Math.cos(',
  tan: 'Math.tan(',
  sqrt: 'Math.sqrt(',
  log: 'Math.log10(',
  ln: 'Math.log('
};

const sanitizeExpression = (raw) => {
  const transformed = raw
    .replace(/\^/g, '**')
    .replace(/%/g, '/100')
    .replace(/sin\(/g, functionMap.sin)
    .replace(/cos\(/g, functionMap.cos)
    .replace(/tan\(/g, functionMap.tan)
    .replace(/sqrt\(/g, functionMap.sqrt)
    .replace(/log\(/g, functionMap.log)
    .replace(/ln\(/g, functionMap.ln);

  return transformed;
};

const appendValue = (value) => {
  display.value += value;
};

const evaluateExpression = () => {
  const expression = display.value.trim();

  if (!expression) {
    return;
  }

  if (expression === SECRET_CODE) {
    if (typeof window.openSecretGame === 'function') {
      window.openSecretGame();
    }
    display.value = '';
    return;
  }

  try {
    const sanitized = sanitizeExpression(expression);
    const result = Function(`"use strict"; return (${sanitized})`)();

    if (!Number.isFinite(result)) {
      throw new Error('Résultat invalide');
    }

    display.value = String(Math.round((result + Number.EPSILON) * 1e12) / 1e12);
  } catch {
    display.value = 'Erreur';
  }
};

buttons.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const action = button.dataset.action;

  switch (action) {
    case 'insert':
      appendValue(button.dataset.value);
      break;
    case 'func':
      appendValue(`${button.dataset.func}(`);
      break;
    case 'const':
      appendValue(button.dataset.value);
      break;
    case 'delete':
      display.value = display.value.slice(0, -1);
      break;
    case 'clear':
      display.value = '';
      break;
    case 'equals':
      evaluateExpression();
      break;
    default:
      break;
  }
});

document.addEventListener('keydown', (event) => {
  const allowed = '0123456789+-*/().%^';

  if (allowed.includes(event.key)) {
    appendValue(event.key);
    return;
  }

  if (event.key === 'Enter') {
    evaluateExpression();
    return;
  }

  if (event.key === 'Backspace') {
    display.value = display.value.slice(0, -1);
    return;
  }

  if (event.key.toLowerCase() === 'c') {
    display.value = '';
  }
});


document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  window.location.href = 'about:blank';
});
