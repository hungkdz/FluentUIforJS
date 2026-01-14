// Fluent UI Library for Tampermonkey Scripts
// Version: 1.0.0 - Pure JavaScript

class FluentOption {
  constructor(defaultValue) {
    this.Value = defaultValue;
    this.callbacks = [];
  }

  SetValue(value) {
    this.Value = value;
    this.callbacks.forEach(cb => cb(value));
  }

  OnChanged(callback) {
    this.callbacks.push(callback);
  }
}

class FluentToggle extends FluentOption {
  OnChanged(callback) {
    super.OnChanged(callback);
  }
}

class FluentSlider extends FluentOption {
  OnChanged(callback) {
    super.OnChanged(callback);
  }
}

class FluentDropdown extends FluentOption {
  OnChanged(callback) {
    super.OnChanged(callback);
  }
}

class FluentColorpicker extends FluentOption {
  constructor(defaultValue) {
    super(defaultValue);
    this.Transparency = 1;
  }

  SetValueRGB(color) {
    this.SetValue(color);
  }
}

class FluentKeybind extends FluentOption {
  constructor(defaultValue) {
    super(defaultValue);
    this.state = false;
    this.mode = 'Toggle';
    this.clickCallbacks = [];
  }

  SetValue(key, mode) {
    super.SetValue(key);
    if (mode) this.mode = mode;
  }

  GetState() {
    return this.state;
  }

  SetState(state) {
    this.state = state;
  }

  OnClick(callback) {
    this.clickCallbacks.push(callback);
  }

  TriggerClick() {
    this.clickCallbacks.forEach(cb => cb());
  }
}

class FluentInput extends FluentOption {
  OnChanged(callback) {
    super.OnChanged(callback);
  }
}

class FluentTab {
  constructor(config, content) {
    this.Title = config.Title;
    this.Icon = config.Icon;
    this.content = content;
    this.elements = [];
  }

  getTitle() {
    return this.Title;
  }

  getIcon() {
    return this.Icon;
  }

  getContent() {
    return this.content;
  }

  AddParagraph(config) {
    const element = document.createElement('div');
    element.className = 'fluent-paragraph';
    element.innerHTML = `
      <div class="fluent-paragraph-title">${config.Title}</div>
      <div class="fluent-paragraph-content">${config.Content.replace(/\n/g, '<br>')}</div>
    `;
    this.content.appendChild(element);
    this.elements.push(element);
  }

  AddButton(config) {
    const element = document.createElement('div');
    element.className = 'fluent-button-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
        ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
      </div>
      <button class="fluent-button">Click</button>
    `;
    
    const button = element.querySelector('.fluent-button');
    button.addEventListener('click', config.Callback);
    
    this.content.appendChild(element);
    this.elements.push(element);
  }

  AddToggle(id, config) {
    const toggle = new FluentToggle(config.Default !== undefined ? config.Default : false);
    
    const element = document.createElement('div');
    element.className = 'fluent-toggle-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
        ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
      </div>
      <label class="fluent-toggle">
        <input type="checkbox" ${config.Default ? 'checked' : ''}>
        <span class="fluent-toggle-slider"></span>
      </label>
    `;
    
    const checkbox = element.querySelector('input');
    checkbox.addEventListener('change', () => {
      toggle.SetValue(checkbox.checked);
    });
    
    toggle.OnChanged((value) => {
      checkbox.checked = value;
    });
    
    this.content.appendChild(element);
    this.elements.push(element);
    
    return toggle;
  }

  AddSlider(id, config) {
    const slider = new FluentSlider(config.Default !== undefined ? config.Default : config.Min);
    
    const element = document.createElement('div');
    element.className = 'fluent-slider-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
        ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
      </div>
      <div class="fluent-slider-wrapper">
        <input type="range" min="${config.Min}" max="${config.Max}" step="${config.Rounding !== undefined ? Math.pow(10, -config.Rounding) : 1}" value="${config.Default !== undefined ? config.Default : config.Min}" class="fluent-slider">
        <span class="fluent-slider-value">${config.Default !== undefined ? config.Default : config.Min}</span>
      </div>
    `;
    
    const input = element.querySelector('input');
    const valueDisplay = element.querySelector('.fluent-slider-value');
    
    input.addEventListener('input', () => {
      const value = config.Rounding !== undefined 
        ? parseFloat(parseFloat(input.value).toFixed(config.Rounding))
        : parseInt(input.value);
      valueDisplay.textContent = value.toString();
      slider.SetValue(value);
      if (config.Callback) config.Callback(value);
    });
    
    slider.OnChanged((value) => {
      input.value = value.toString();
      valueDisplay.textContent = value.toString();
    });
    
    this.content.appendChild(element);
    this.elements.push(element);
    
    return slider;
  }

  AddDropdown(id, config) {
    const defaultValue = config.Multi 
      ? (Array.isArray(config.Default) ? config.Default : [])
      : (typeof config.Default === 'number' ? config.Values[config.Default - 1] : (config.Default || config.Values[0]));
    
    const dropdown = new FluentDropdown(defaultValue);
    
    const element = document.createElement('div');
    element.className = 'fluent-dropdown-container';
    
    if (config.Multi) {
      const selectedValues = new Set(defaultValue);
      
      element.innerHTML = `
        <div class="fluent-control-header">
          <div class="fluent-control-title">${config.Title}</div>
          ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
        </div>
        <div class="fluent-dropdown-multi">
          <div class="fluent-dropdown-trigger">
            <span class="fluent-dropdown-text">${selectedValues.size > 0 ? Array.from(selectedValues).join(', ') : 'Select...'}</span>
            <span class="fluent-dropdown-arrow">▼</span>
          </div>
          <div class="fluent-dropdown-options" style="display: none;">
            ${config.Values.map(val => `
              <label class="fluent-dropdown-option-multi">
                <input type="checkbox" value="${val}" ${selectedValues.has(val) ? 'checked' : ''}>
                <span>${val}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
      
      const trigger = element.querySelector('.fluent-dropdown-trigger');
      const optionsContainer = element.querySelector('.fluent-dropdown-options');
      const text = element.querySelector('.fluent-dropdown-text');
      const checkboxes = element.querySelectorAll('input[type="checkbox"]');
      
      trigger.addEventListener('click', () => {
        optionsContainer.style.display = optionsContainer.style.display === 'none' ? 'block' : 'none';
      });
      
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            selectedValues.add(checkbox.value);
          } else {
            selectedValues.delete(checkbox.value);
          }
          
          const values = Array.from(selectedValues);
          text.textContent = values.length > 0 ? values.join(', ') : 'Select...';
          dropdown.SetValue(values);
        });
      });
      
      const originalSetValue = dropdown.SetValue.bind(dropdown);
      dropdown.SetValue = (value) => {
        selectedValues.clear();
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([key, val]) => {
            if (val) selectedValues.add(key);
          });
        } else if (Array.isArray(value)) {
          value.forEach(v => selectedValues.add(v));
        }
        
        checkboxes.forEach(cb => {
          cb.checked = selectedValues.has(cb.value);
        });
        
        const values = Array.from(selectedValues);
        text.textContent = values.length > 0 ? values.join(', ') : 'Select...';
        originalSetValue(values);
      };
      
    } else {
      element.innerHTML = `
        <div class="fluent-control-header">
          <div class="fluent-control-title">${config.Title}</div>
          ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
        </div>
        <select class="fluent-dropdown">
          ${config.Values.map(val => `<option value="${val}" ${val === defaultValue ? 'selected' : ''}>${val}</option>`).join('')}
        </select>
      `;
      
      const select = element.querySelector('select');
      select.addEventListener('change', () => {
        dropdown.SetValue(select.value);
      });
      
      dropdown.OnChanged((value) => {
        select.value = value;
      });
    }
    
    this.content.appendChild(element);
    this.elements.push(element);
    
    return dropdown;
  }

  AddColorpicker(id, config) {
    const colorpicker = new FluentColorpicker(config.Default || '#60cdff');
    if (config.Transparency !== undefined) {
      colorpicker.Transparency = config.Transparency;
    }
    
    const element = document.createElement('div');
    element.className = 'fluent-colorpicker-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
        ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
      </div>
      <div class="fluent-colorpicker-wrapper">
        <input type="color" value="${config.Default || '#60cdff'}" class="fluent-colorpicker">
        <span class="fluent-colorpicker-value">${config.Default || '#60cdff'}</span>
        ${config.Transparency !== undefined ? `
          <input type="range" min="0" max="1" step="0.01" value="${config.Transparency}" class="fluent-transparency-slider">
          <span class="fluent-transparency-value">${config.Transparency}</span>
        ` : ''}
      </div>
    `;
    
    const colorInput = element.querySelector('.fluent-colorpicker');
    const valueDisplay = element.querySelector('.fluent-colorpicker-value');
    
    colorInput.addEventListener('input', () => {
      valueDisplay.textContent = colorInput.value;
      colorpicker.SetValue(colorInput.value);
    });
    
    if (config.Transparency !== undefined) {
      const transparencySlider = element.querySelector('.fluent-transparency-slider');
      const transparencyValue = element.querySelector('.fluent-transparency-value');
      
      transparencySlider.addEventListener('input', () => {
        const transparency = parseFloat(transparencySlider.value);
        transparencyValue.textContent = transparency.toFixed(2);
        colorpicker.Transparency = transparency;
        colorpicker.SetValue(colorpicker.Value);
      });
    }
    
    colorpicker.OnChanged((value) => {
      colorInput.value = value;
      valueDisplay.textContent = value;
    });
    
    this.content.appendChild(element);
    this.elements.push(element);
    
    return colorpicker;
  }

  AddKeybind(id, config) {
    const keybind = new FluentKeybind(config.Default || 'None');
    
    const element = document.createElement('div');
    element.className = 'fluent-keybind-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
      </div>
      <button class="fluent-keybind-button">${config.Default || 'None'}</button>
    `;
    
    const button = element.querySelector('.fluent-keybind-button');
    let isListening = false;
    
    button.addEventListener('click', () => {
      if (!isListening) {
        isListening = true;
        button.textContent = 'Press a key...';
        button.classList.add('fluent-keybind-listening');
      }
    });
    
    const keyHandler = (e) => {
      if (isListening) {
        e.preventDefault();
        const key = e.key === ' ' ? 'Space' : e.key;
        button.textContent = key;
        button.classList.remove('fluent-keybind-listening');
        isListening = false;
        keybind.SetValue(key);
        if (config.ChangedCallback) config.ChangedCallback(key);
      }
      
      if (e.key === keybind.Value || (keybind.Value === 'Space' && e.key === ' ')) {
        const mode = config.Mode || 'Toggle';
        
        if (mode === 'Always') {
          keybind.SetState(true);
          keybind.TriggerClick();
          if (config.Callback) config.Callback(true);
        } else if (mode === 'Toggle') {
          const newState = !keybind.GetState();
          keybind.SetState(newState);
          keybind.TriggerClick();
          if (config.Callback) config.Callback(newState);
        } else if (mode === 'Hold' && e.type === 'keydown') {
          keybind.SetState(true);
          keybind.TriggerClick();
          if (config.Callback) config.Callback(true);
        }
      }
    };
    
    const keyUpHandler = (e) => {
      if ((e.key === keybind.Value || (keybind.Value === 'Space' && e.key === ' ')) && (config.Mode || 'Toggle') === 'Hold') {
        keybind.SetState(false);
        if (config.Callback) config.Callback(false);
      }
    };
    
    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keyup', keyUpHandler);
    
    keybind.OnChanged((value) => {
      button.textContent = value;
    });
    
    this.content.appendChild(element);
    this.elements.push(element);
    
    return keybind;
  }

  AddInput(id, config) {
    const input = new FluentInput(config.Default || '');
    
    const element = document.createElement('div');
    element.className = 'fluent-input-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
      </div>
      <input type="${config.Numeric ? 'number' : 'text'}" 
             class="fluent-input" 
             value="${config.Default || ''}" 
             placeholder="${config.Placeholder || ''}">
    `;
    
    const inputElement = element.querySelector('input');
    
    if (config.Finished) {
      inputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          input.SetValue(inputElement.value);
          if (config.Callback) config.Callback(inputElement.value);
        }
      });
    } else {
      inputElement.addEventListener('input', () => {
        input.SetValue(inputElement.value);
        if (config.Callback) config.Callback(inputElement.value);
      });
    }
    
    input.OnChanged((value) => {
      inputElement.value = value;
    });
    
    this.content.appendChild(element);
    this.elements.push(element);
    
    return input;
  }
}

class FluentWindow {
  constructor(config) {
    this.config = config;
    this.tabs = new Map();
    this.tabButtons = new Map();
    this.currentTab = null;
    this.isMinimized = false;
    this.window = this.createWindow();
    document.body.appendChild(this.window);
    this.setupMinimizeKey();
  }

  createWindow() {
    const container = document.createElement('div');
    container.className = `fluent-window ${(this.config.Theme || 'Dark').toLowerCase()}`;
    container.style.cssText = `
      width: ${(this.config.Size && this.config.Size.width) || 580}px;
      height: ${(this.config.Size && this.config.Size.height) || 460}px;
    `;
    
    container.innerHTML = `
      <div class="fluent-window-header">
        <div class="fluent-window-title-container">
          <div class="fluent-window-title">${this.config.Title}</div>
          ${this.config.SubTitle ? `<div class="fluent-window-subtitle">${this.config.SubTitle}</div>` : ''}
        </div>
        <div class="fluent-window-controls">
          <button class="fluent-window-minimize">−</button>
          <button class="fluent-window-close">×</button>
        </div>
      </div>
      <div class="fluent-window-body">
        <div class="fluent-tabs-container" style="width: ${this.config.TabWidth || 160}px;"></div>
        <div class="fluent-content-container"></div>
      </div>
    `;
    
    this.makeDraggable(container);
    
    const minimizeBtn = container.querySelector('.fluent-window-minimize');
    const closeBtn = container.querySelector('.fluent-window-close');
    
    minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    closeBtn.addEventListener('click', () => this.close());
    
    return container;
  }

  makeDraggable(element) {
    const header = element.querySelector('.fluent-window-header');
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        isDragging = true;
        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  setupMinimizeKey() {
    if (this.config.MinimizeKey) {
      document.addEventListener('keydown', (e) => {
        if (e.key === this.config.MinimizeKey) {
          e.preventDefault();
          this.toggleMinimize();
        }
      });
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const body = this.window.querySelector('.fluent-window-body');
    
    if (this.isMinimized) {
      body.style.display = 'none';
      this.window.style.height = 'auto';
    } else {
      body.style.display = 'flex';
      this.window.style.height = `${(this.config.Size && this.config.Size.height) || 460}px`;
    }
  }

  close() {
    this.window.remove();
  }

  AddTab(config) {
    const tabsContainer = this.window.querySelector('.fluent-tabs-container');
    const contentContainer = this.window.querySelector('.fluent-content-container');
    
    const tabButton = document.createElement('div');
    tabButton.className = 'fluent-tab-button';
    tabButton.innerHTML = `
      ${config.Icon ? `<span class="fluent-tab-icon">${config.Icon}</span>` : ''}
      <span class="fluent-tab-title">${config.Title}</span>
    `;
    
    const tabContent = document.createElement('div');
    tabContent.className = 'fluent-tab-content';
    tabContent.style.display = 'none';
    
    const tab = new FluentTab(config, tabContent);
    
    tabButton.addEventListener('click', () => {
      this.SelectTab(Array.from(this.tabs.keys()).indexOf(config.Title) + 1);
    });
    
    tabsContainer.appendChild(tabButton);
    contentContainer.appendChild(tabContent);
    
    this.tabs.set(config.Title, tab);
    this.tabButtons.set(config.Title, tabButton);
    
    return tab;
  }

  SelectTab(index) {
    const tabKeys = Array.from(this.tabs.keys());
    if (index < 1 || index > tabKeys.length) return;
    
    const selectedKey = tabKeys[index - 1];
    
    this.tabs.forEach((tab, key) => {
      tab.getContent().style.display = 'none';
      const btn = this.tabButtons.get(key);
      if (btn) btn.classList.remove('active');
    });
    
    const selectedTab = this.tabs.get(selectedKey);
    if (selectedTab) {
      selectedTab.getContent().style.display = 'block';
      const btn = this.tabButtons.get(selectedKey);
      if (btn) btn.classList.add('active');
      this.currentTab = selectedKey;
    }
  }

  Dialog(config) {
    const overlay = document.createElement('div');
    overlay.className = 'fluent-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'fluent-dialog';
    dialog.innerHTML = `
      <div class="fluent-dialog-title">${config.Title}</div>
      <div class="fluent-dialog-content">${config.Content}</div>
      <div class="fluent-dialog-buttons">
        ${config.Buttons.map((btn, idx) => `
          <button class="fluent-dialog-button" data-index="${idx}">${btn.Title}</button>
        `).join('')}
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const buttons = dialog.querySelectorAll('.fluent-dialog-button');
    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        config.Buttons[idx].Callback();
        overlay.remove();
      });
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }
}

class Fluent {
  constructor() {
    this.Version = '1.0.0';
    this.Options = {};
    this.Unloaded = false;
  }

  CreateWindow(config) {
    return new FluentWindow(config);
  }

  Notify(config) {
    const container = this.getOrCreateNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'fluent-notification';
    notification.innerHTML = `
      <div class="fluent-notification-title">${config.Title}</div>
      <div class="fluent-notification-content">${config.Content}</div>
      ${config.SubContent ? `<div class="fluent-notification-subcontent">${config.SubContent}</div>` : ''}
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    if (config.Duration !== null) {
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, (config.Duration !== undefined ? config.Duration : 5) * 1000);
    }
  }

  getOrCreateNotificationContainer() {
    let container = document.querySelector('.fluent-notifications-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'fluent-notifications-container';
      document.body.appendChild(container);
    }
    return container;
  }
}

const FluentUI = new Fluent();

if (typeof window !== 'undefined') {
  window.Fluent = FluentUI;
}
