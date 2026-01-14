// InterfaceManager for Fluent UI
// Handles theme and interface settings

class InterfaceManager {
  private Library: any = null;
  private Folder: string = 'FluentUI';
  private CurrentTheme: 'Dark' | 'Light' = 'Dark';

  SetLibrary(library: any) {
    this.Library = library;
  }

  SetFolder(folder: string) {
    this.Folder = folder;
  }

  private getStorageKey(): string {
    return `${this.Folder}/InterfaceSettings`;
  }

  SetTheme(theme: 'Dark' | 'Light') {
    this.CurrentTheme = theme;
    
    // Update all windows
    const windows = document.querySelectorAll('.fluent-window');
    windows.forEach(window => {
      window.classList.remove('dark', 'light');
      window.classList.add(theme.toLowerCase());
    });

    this.SaveSettings();
  }

  GetTheme(): 'Dark' | 'Light' {
    return this.CurrentTheme;
  }

  private SaveSettings() {
    try {
      const settings = {
        theme: this.CurrentTheme
      };
      localStorage.setItem(this.getStorageKey(), JSON.stringify(settings));
    } catch (error) {
      console.error('InterfaceManager: Error saving settings', error);
    }
  }

  private LoadSettings() {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.theme) {
          this.SetTheme(settings.theme);
        }
      }
    } catch (error) {
      console.error('InterfaceManager: Error loading settings', error);
    }
  }

  BuildInterfaceSection(tab: any) {
    if (!tab || !tab.AddParagraph) {
      console.error('InterfaceManager: Invalid tab');
      return;
    }

    tab.AddParagraph({
      Title: 'Interface Settings',
      Content: 'Customize the appearance of the interface'
    });

    // Theme dropdown
    const themeDropdown = tab.AddDropdown('ThemeSelector', {
      Title: 'Theme',
      Description: 'Select interface theme',
      Values: ['Dark', 'Light'],
      Default: this.CurrentTheme
    });

    themeDropdown.OnChanged((value: string) => {
      this.SetTheme(value as 'Dark' | 'Light');
      
      if (this.Library && this.Library.Notify) {
        this.Library.Notify({
          Title: 'Theme Changed',
          Content: `Theme set to ${value}`,
          Duration: 2
        });
      }
    });

    // Transparency toggle (if supported)
    const transparencyToggle = tab.AddToggle('WindowTransparency', {
      Title: 'Window Transparency',
      Description: 'Enable transparent window background (if supported)',
      Default: false
    });

    transparencyToggle.OnChanged((enabled: boolean) => {
      const windows = document.querySelectorAll('.fluent-window');
      windows.forEach(window => {
        if (enabled) {
          (window as HTMLElement).style.backdropFilter = 'blur(10px)';
          (window as HTMLElement).style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
        } else {
          (window as HTMLElement).style.backdropFilter = '';
          (window as HTMLElement).style.backgroundColor = '';
        }
      });
    });

    // Reset interface settings
    tab.AddButton({
      Title: 'Reset Interface Settings',
      Description: 'Reset to default interface settings',
      Callback: () => {
        this.SetTheme('Dark');
        themeDropdown.SetValue('Dark');
        transparencyToggle.SetValue(false);
        
        if (this.Library && this.Library.Notify) {
          this.Library.Notify({
            Title: 'Interface Reset',
            Content: 'Interface settings have been reset to defaults',
            Duration: 3
          });
        }
      }
    });

    // Load saved settings
    this.LoadSettings();
  }
}

// Export singleton
const InterfaceManagerInstance = new InterfaceManager();

if (typeof window !== 'undefined') {
  (window as any).InterfaceManager = InterfaceManagerInstance;
}

export default InterfaceManagerInstance;
