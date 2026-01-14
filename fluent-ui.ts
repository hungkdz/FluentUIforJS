// Fluent UI Library for Tampermonkey Scripts
// Version: 1.0.0

interface WindowConfig {
  Title: string;
  SubTitle?: string;
  TabWidth?: number;
  Size?: { width: number; height: number };
  Acrylic?: boolean;
  Theme?: 'Dark' | 'Light';
  MinimizeKey?: string;
}

interface TabConfig {
  Title: string;
  Icon?: string;
}

interface NotificationConfig {
  Title: string;
  Content: string;
  SubContent?: string;
  Duration?: number | null;
}

interface ButtonConfig {
  Title: string;
  Description?: string;
  Callback: () => void;
}

interface ToggleConfig {
  Title: string;
  Description?: string;
  Default?: boolean;
}

interface SliderConfig {
  Title: string;
  Description?: string;
  Default?: number;
  Min: number;
  Max: number;
  Rounding?: number;
  Callback?: (value: number) => void;
}

interface DropdownConfig {
  Title: string;
  Description?: string;
  Values: string[];
  Multi?: boolean;
  Default?: number | string | string[];
}

interface ColorpickerConfig {
  Title: string;
  Description?: string;
  Default?: string;
  Transparency?: number;
}

interface KeybindConfig {
  Title: string;
  Mode?: 'Always' | 'Toggle' | 'Hold';
  Default?: string;
  Callback?: (value: boolean) => void;
  ChangedCallback?: (key: string) => void;
}

interface InputConfig {
  Title: string;
  Default?: string;
  Placeholder?: string;
  Numeric?: boolean;
  Finished?: boolean;
  Callback?: (value: string) => void;
}

interface ParagraphConfig {
  Title: string;
  Content: string;
}

interface DialogConfig {
  Title: string;
  Content: string;
  Buttons: Array<{
    Title: string;
    Callback: () => void;
  }>;
}

class FluentOption<T> {
  public Value: T;
  private callbacks: ((value: T) => void)[] = [];

  constructor(defaultValue: T) {
    this.Value = defaultValue;
  }

  SetValue(value: T) {
    this.Value = value;
    this.callbacks.forEach(cb => cb(value));
  }

  OnChanged(callback: (value: T) => void) {
    this.callbacks.push(callback);
  }
}

class FluentToggle extends FluentOption<boolean> {
  OnChanged(callback: () => void) {
    super.OnChanged(callback);
  }
}

class FluentSlider extends FluentOption<number> {
  OnChanged(callback: (value: number) => void) {
    super.OnChanged(callback);
  }
}

class FluentDropdown extends FluentOption<string | string[]> {
  OnChanged(callback: (value: string | string[]) => void) {
    super.OnChanged(callback);
  }
}

class FluentColorpicker extends FluentOption<string> {
  public Transparency: number = 1;

  SetValueRGB(color: string) {
    this.SetValue(color);
  }
}

class FluentKeybind extends FluentOption<string> {
  private state: boolean = false;
  private mode: 'Always' | 'Toggle' | 'Hold' = 'Toggle';
  private clickCallbacks: (() => void)[] = [];

  SetValue(key: string, mode?: 'Always' | 'Toggle' | 'Hold') {
    super.SetValue(key);
    if (mode) this.mode = mode;
  }

  GetState(): boolean {
    return this.state;
  }

  SetState(state: boolean) {
    this.state = state;
  }

  OnClick(callback: () => void) {
    this.clickCallbacks.push(callback);
  }

  TriggerClick() {
    this.clickCallbacks.forEach(cb => cb());
  }
}

class FluentInput extends FluentOption<string> {
  OnChanged(callback: () => void) {
    super.OnChanged(callback);
  }
}

class FluentTab {
  private Title: string;
  private Icon?: string;
  private content: HTMLElement;
  private elements: HTMLElement[] = [];

  constructor(config: TabConfig, content: HTMLElement) {
    this.Title = config.Title;
    this.Icon = config.Icon;
    this.content = content;
  }

  getTitle(): string {
    return this.Title;
  }

  getIcon(): string | undefined {
    return this.Icon;
  }

  getContent(): HTMLElement {
    return this.content;
  }

  AddParagraph(config: ParagraphConfig): void {
    const element = document.createElement('div');
    element.className = 'fluent-paragraph';
    element.innerHTML = `
      <div class="fluent-paragraph-title">${config.Title}</div>
      <div class="fluent-paragraph-content">${config.Content.replace(/\n/g, '<br>')}</div>
    `;
    this.content.appendChild(element);
    this.elements.push(element);
  }

  AddButton(config: ButtonConfig): void {
    const element = document.createElement('div');
    element.className = 'fluent-button-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
        ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
      </div>
      <button class="fluent-button">Click</button>
    `;
    
    const button = element.querySelector('.fluent-button') as HTMLButtonElement;
    button.addEventListener('click', config.Callback);
    
    this.content.appendChild(element);
    this.elements.push(element);
  }

  AddToggle(id: string, config: ToggleConfig): FluentToggle {
    const toggle = new FluentToggle(config.Default ?? false);
    
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
    
    const checkbox = element.querySelector('input') as HTMLInputElement;
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

  AddSlider(id: string, config: SliderConfig): FluentSlider {
    const slider = new FluentSlider(config.Default ?? config.Min);
    
    const element = document.createElement('div');
    element.className = 'fluent-slider-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
        ${config.Description ? `<div class="fluent-control-description">${config.Description}</div>` : ''}
      </div>
      <div class="fluent-slider-wrapper">
        <input type="range" min="${config.Min}" max="${config.Max}" step="${config.Rounding !== undefined ? Math.pow(10, -config.Rounding) : 1}" value="${config.Default ?? config.Min}" class="fluent-slider">
        <span class="fluent-slider-value">${config.Default ?? config.Min}</span>
      </div>
    `;
    
    const input = element.querySelector('input') as HTMLInputElement;
    const valueDisplay = element.querySelector('.fluent-slider-value') as HTMLSpanElement;
    
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

  AddDropdown(id: string, config: DropdownConfig): FluentDropdown {
    const defaultValue = config.Multi 
      ? (Array.isArray(config.Default) ? config.Default : [])
      : (typeof config.Default === 'number' ? config.Values[config.Default - 1] : (config.Default || config.Values[0]));
    
    const dropdown = new FluentDropdown(defaultValue);
    
    const element = document.createElement('div');
    element.className = 'fluent-dropdown-container';
    
    if (config.Multi) {
      const selectedValues = new Set(defaultValue as string[]);
      
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
      
      const trigger = element.querySelector('.fluent-dropdown-trigger') as HTMLElement;
      const optionsContainer = element.querySelector('.fluent-dropdown-options') as HTMLElement;
      const text = element.querySelector('.fluent-dropdown-text') as HTMLElement;
      const checkboxes = element.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
      
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
      
      // Custom SetValue for multi-dropdown
      const originalSetValue = dropdown.SetValue.bind(dropdown);
      dropdown.SetValue = (value: any) => {
        selectedValues.clear();
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle {three: true, five: true, seven: false} format
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
      
      const select = element.querySelector('select') as HTMLSelectElement;
      select.addEventListener('change', () => {
        dropdown.SetValue(select.value);
      });
      
      dropdown.OnChanged((value) => {
        select.value = value as string;
      });
    }
    
    this.content.appendChild(element);
    this.elements.push(element);
    
    return dropdown;
  }

  AddColorpicker(id: string, config: ColorpickerConfig): FluentColorpicker {
    const colorpicker = new FluentColorpicker(config.Default ?? '#60cdff');
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
        <input type="color" value="${config.Default ?? '#60cdff'}" class="fluent-colorpicker">
        <span class="fluent-colorpicker-value">${config.Default ?? '#60cdff'}</span>
        ${config.Transparency !== undefined ? `
          <input type="range" min="0" max="1" step="0.01" value="${config.Transparency}" class="fluent-transparency-slider">
          <span class="fluent-transparency-value">${config.Transparency}</span>
        ` : ''}
      </div>
    `;
    
    const colorInput = element.querySelector('.fluent-colorpicker') as HTMLInputElement;
    const valueDisplay = element.querySelector('.fluent-colorpicker-value') as HTMLSpanElement;
    
    colorInput.addEventListener('input', () => {
      valueDisplay.textContent = colorInput.value;
      colorpicker.SetValue(colorInput.value);
    });
    
    if (config.Transparency !== undefined) {
      const transparencySlider = element.querySelector('.fluent-transparency-slider') as HTMLInputElement;
      const transparencyValue = element.querySelector('.fluent-transparency-value') as HTMLSpanElement;
      
      transparencySlider.addEventListener('input', () => {
        const transparency = parseFloat(transparencySlider.value);
        transparencyValue.textContent = transparency.toFixed(2);
        colorpicker.Transparency = transparency;
        colorpicker.SetValue(colorpicker.Value); // Trigger callbacks
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

  AddKeybind(id: string, config: KeybindConfig): FluentKeybind {
    const keybind = new FluentKeybind(config.Default ?? 'None');
    
    const element = document.createElement('div');
    element.className = 'fluent-keybind-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
      </div>
      <button class="fluent-keybind-button">${config.Default ?? 'None'}</button>
    `;
    
    const button = element.querySelector('.fluent-keybind-button') as HTMLButtonElement;
    let isListening = false;
    
    button.addEventListener('click', () => {
      if (!isListening) {
        isListening = true;
        button.textContent = 'Press a key...';
        button.classList.add('fluent-keybind-listening');
      }
    });
    
    const keyHandler = (e: KeyboardEvent) => {
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
        const mode = config.Mode ?? 'Toggle';
        
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
    
    const keyUpHandler = (e: KeyboardEvent) => {
      if ((e.key === keybind.Value || (keybind.Value === 'Space' && e.key === ' ')) && (config.Mode ?? 'Toggle') === 'Hold') {
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

  AddInput(id: string, config: InputConfig): FluentInput {
    const input = new FluentInput(config.Default ?? '');
    
    const element = document.createElement('div');
    element.className = 'fluent-input-container';
    element.innerHTML = `
      <div class="fluent-control-header">
        <div class="fluent-control-title">${config.Title}</div>
      </div>
      <input type="${config.Numeric ? 'number' : 'text'}" 
             class="fluent-input" 
             value="${config.Default ?? ''}" 
             placeholder="${config.Placeholder ?? ''}">
    `;
    
    const inputElement = element.querySelector('input') as HTMLInputElement;
    
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
  private config: WindowConfig;
  private window: HTMLElement;
  private tabs: Map<string, FluentTab> = new Map();
  private tabButtons: Map<string, HTMLElement> = new Map();
  private currentTab: string | null = null;
  private isMinimized: boolean = false;

  constructor(config: WindowConfig) {
    this.config = config;
    this.window = this.createWindow();
    document.body.appendChild(this.window);
    this.setupMinimizeKey();
  }

  private createWindow(): HTMLElement {
    const container = document.createElement('div');
    container.className = `fluent-window ${this.config.Theme?.toLowerCase() ?? 'dark'}`;
    container.style.cssText = `
      width: ${this.config.Size?.width ?? 580}px;
      height: ${this.config.Size?.height ?? 460}px;
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
        <div class="fluent-tabs-container" style="width: ${this.config.TabWidth ?? 160}px;"></div>
        <div class="fluent-content-container"></div>
      </div>
    `;
    
    // Setup draggable
    this.makeDraggable(container);
    
    // Setup controls
    const minimizeBtn = container.querySelector('.fluent-window-minimize') as HTMLElement;
    const closeBtn = container.querySelector('.fluent-window-close') as HTMLElement;
    
    minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    closeBtn.addEventListener('click', () => this.close());
    
    return container;
  }

  private makeDraggable(element: HTMLElement) {
    const header = element.querySelector('.fluent-window-header') as HTMLElement;
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    header.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).tagName !== 'BUTTON') {
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

  private setupMinimizeKey() {
    if (this.config.MinimizeKey) {
      document.addEventListener('keydown', (e) => {
        if (e.key === this.config.MinimizeKey) {
          e.preventDefault();
          this.toggleMinimize();
        }
      });
    }
  }

  private toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const body = this.window.querySelector('.fluent-window-body') as HTMLElement;
    
    if (this.isMinimized) {
      body.style.display = 'none';
      this.window.style.height = 'auto';
    } else {
      body.style.display = 'flex';
      this.window.style.height = `${this.config.Size?.height ?? 460}px`;
    }
  }

  private close() {
    this.window.remove();
  }

  AddTab(config: TabConfig): FluentTab {
    const tabsContainer = this.window.querySelector('.fluent-tabs-container') as HTMLElement;
    const contentContainer = this.window.querySelector('.fluent-content-container') as HTMLElement;
    
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

  SelectTab(index: number) {
    const tabKeys = Array.from(this.tabs.keys());
    if (index < 1 || index > tabKeys.length) return;
    
    const selectedKey = tabKeys[index - 1];
    
    // Hide all tabs
    this.tabs.forEach((tab, key) => {
      tab.getContent().style.display = 'none';
      this.tabButtons.get(key)?.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = this.tabs.get(selectedKey);
    if (selectedTab) {
      selectedTab.getContent().style.display = 'block';
      this.tabButtons.get(selectedKey)?.classList.add('active');
      this.currentTab = selectedKey;
    }
  }

  Dialog(config: DialogConfig) {
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
  public Version = '1.0.0';
  public Options: Record<string, any> = {};
  public Unloaded = false;

  CreateWindow(config: WindowConfig): FluentWindow {
    return new FluentWindow(config);
  }

  Notify(config: NotificationConfig) {
    const container = this.getOrCreateNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'fluent-notification';
    notification.innerHTML = `
      <div class="fluent-notification-title">${config.Title}</div>
      <div class="fluent-notification-content">${config.Content}</div>
      ${config.SubContent ? `<div class="fluent-notification-subcontent">${config.SubContent}</div>` : ''}
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove
    if (config.Duration !== null) {
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, (config.Duration ?? 5) * 1000);
    }
  }

  private getOrCreateNotificationContainer(): HTMLElement {
    let container = document.querySelector('.fluent-notifications-container') as HTMLElement;
    if (!container) {
      container = document.createElement('div');
      container.className = 'fluent-notifications-container';
      document.body.appendChild(container);
    }
    return container;
  }
}

// Export singleton instance
const FluentUI = new Fluent();

// For use in browser/Tampermonkey
if (typeof window !== 'undefined') {
  (window as any).Fluent = FluentUI;
}

export default FluentUI;
