// SaveManager for Fluent UI
// Handles saving and loading of settings

interface SaveData {
  [key: string]: any;
}

class SaveManager {
  private Library: any = null;
  private Folder: string = 'FluentUI';
  private IgnoreIndexes: Set<string> = new Set();
  private IgnoreTheme: boolean = false;

  SetLibrary(library: any) {
    this.Library = library;
  }

  SetFolder(folder: string) {
    this.Folder = folder;
  }

  SetIgnoreIndexes(indexes: string[]) {
    this.IgnoreIndexes = new Set(indexes);
  }

  IgnoreThemeSettings() {
    this.IgnoreTheme = true;
  }

  private getStorageKey(configName: string): string {
    return `${this.Folder}/${configName}`;
  }

  Save(configName: string) {
    if (!this.Library) {
      console.error('SaveManager: Library not set');
      return;
    }

    const data: SaveData = {};

    // Save all options
    Object.keys(this.Library.Options).forEach(key => {
      if (!this.IgnoreIndexes.has(key)) {
        const option = this.Library.Options[key];
        if (option && option.Value !== undefined) {
          data[key] = option.Value;
          
          // Special handling for colorpicker transparency
          if (option.Transparency !== undefined) {
            data[`${key}_Transparency`] = option.Transparency;
          }
        }
      }
    });

    try {
      localStorage.setItem(this.getStorageKey(configName), JSON.stringify(data));
      
      if (this.Library.Notify) {
        this.Library.Notify({
          Title: 'Configuration Saved',
          Content: `Successfully saved configuration: ${configName}`,
          Duration: 3
        });
      }
    } catch (error) {
      console.error('SaveManager: Error saving data', error);
      if (this.Library.Notify) {
        this.Library.Notify({
          Title: 'Save Error',
          Content: 'Failed to save configuration',
          Duration: 3
        });
      }
    }
  }

  Load(configName: string) {
    if (!this.Library) {
      console.error('SaveManager: Library not set');
      return;
    }

    try {
      const saved = localStorage.getItem(this.getStorageKey(configName));
      if (!saved) {
        if (this.Library.Notify) {
          this.Library.Notify({
            Title: 'Load Error',
            Content: `Configuration "${configName}" not found`,
            Duration: 3
          });
        }
        return;
      }

      const data: SaveData = JSON.parse(saved);

      // Load all options
      Object.keys(data).forEach(key => {
        if (key.endsWith('_Transparency')) {
          // Handle transparency separately
          const baseKey = key.replace('_Transparency', '');
          if (this.Library.Options[baseKey]) {
            this.Library.Options[baseKey].Transparency = data[key];
          }
        } else if (this.Library.Options[key]) {
          this.Library.Options[key].SetValue(data[key]);
        }
      });

      if (this.Library.Notify) {
        this.Library.Notify({
          Title: 'Configuration Loaded',
          Content: `Successfully loaded configuration: ${configName}`,
          Duration: 3
        });
      }
    } catch (error) {
      console.error('SaveManager: Error loading data', error);
      if (this.Library.Notify) {
        this.Library.Notify({
          Title: 'Load Error',
          Content: 'Failed to load configuration',
          Duration: 3
        });
      }
    }
  }

  Delete(configName: string) {
    try {
      localStorage.removeItem(this.getStorageKey(configName));
      
      if (this.Library && this.Library.Notify) {
        this.Library.Notify({
          Title: 'Configuration Deleted',
          Content: `Successfully deleted configuration: ${configName}`,
          Duration: 3
        });
      }
    } catch (error) {
      console.error('SaveManager: Error deleting data', error);
    }
  }

  GetConfigs(): string[] {
    const configs: string[] = [];
    const prefix = `${this.Folder}/`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        configs.push(key.substring(prefix.length));
      }
    }

    return configs;
  }

  BuildConfigSection(tab: any) {
    if (!tab || !tab.AddParagraph) {
      console.error('SaveManager: Invalid tab');
      return;
    }

    tab.AddParagraph({
      Title: 'Configuration',
      Content: 'Save and load your settings'
    });

    // Config name input
    const configNameInput = tab.AddInput('ConfigName', {
      Title: 'Configuration Name',
      Default: 'default',
      Placeholder: 'Enter configuration name'
    });

    // Save button
    tab.AddButton({
      Title: 'Save Configuration',
      Description: 'Save current settings',
      Callback: () => {
        const configName = configNameInput.Value || 'default';
        this.Save(configName);
      }
    });

    // Load button
    tab.AddButton({
      Title: 'Load Configuration',
      Description: 'Load saved settings',
      Callback: () => {
        const configName = configNameInput.Value || 'default';
        this.Load(configName);
      }
    });

    // Delete button
    tab.AddButton({
      Title: 'Delete Configuration',
      Description: 'Delete a saved configuration',
      Callback: () => {
        const configName = configNameInput.Value || 'default';
        if (confirm(`Are you sure you want to delete configuration "${configName}"?`)) {
          this.Delete(configName);
        }
      }
    });

    // List configs
    tab.AddButton({
      Title: 'List Configurations',
      Description: 'Show all saved configurations',
      Callback: () => {
        const configs = this.GetConfigs();
        if (this.Library && this.Library.Notify) {
          this.Library.Notify({
            Title: 'Saved Configurations',
            Content: configs.length > 0 
              ? configs.join(', ') 
              : 'No configurations found',
            Duration: 5
          });
        }
      }
    });

    // Auto-load default on startup
    setTimeout(() => {
      const configs = this.GetConfigs();
      if (configs.includes('default')) {
        this.Load('default');
      }
    }, 100);
  }
}

// Export singleton
const SaveManagerInstance = new SaveManager();

if (typeof window !== 'undefined') {
  (window as any).SaveManager = SaveManagerInstance;
}

export default SaveManagerInstance;
