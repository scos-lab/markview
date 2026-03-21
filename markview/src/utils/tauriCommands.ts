import { invoke } from '@tauri-apps/api/core';

export interface FileResult {
  path: string;
  content: string;
}

export const tauriCommands = {
  async openFileDialog(): Promise<FileResult | null> {
    return invoke<FileResult | null>('open_file_dialog');
  },

  async readFile(path: string): Promise<string> {
    return invoke<string>('read_file', { path });
  },

  async watchFile(path: string): Promise<void> {
    return invoke<void>('watch_file', { path });
  },

  async unwatchFile(): Promise<void> {
    return invoke<void>('unwatch_file');
  },

  async openDefaultAppsSettings(): Promise<void> {
    return invoke<void>('open_default_apps_settings');
  },

  async getInitialFile(): Promise<string | null> {
    return invoke<string | null>('get_initial_file');
  }
};
