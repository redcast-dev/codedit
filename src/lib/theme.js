/**
 * Professional VS Code-inspired theme system
 */

export const themes = {
    dark: {
        name: "Dark+ (default dark)",
        type: "dark",
        colors: {
            // Editor
            'editor.background': '#1e1e1e',
            'editor.foreground': '#d4d4d4',
            'editor.lineHighlightBackground': '#2a2a2a',
            'editor.selectionBackground': '#264f78',

            // Sidebar
            'sideBar.background': '#252526',
            'sideBar.foreground': '#cccccc',
            'sideBar.border': '#1e1e1e',

            // Activity Bar
            'activityBar.background': '#333333',
            'activityBar.foreground': '#ffffff',
            'activityBar.activeBorder': '#007acc',

            // Status Bar
            'statusBar.background': '#007acc',
            'statusBar.foreground': '#ffffff',
            'statusBar.noFolderBackground': '#68217a',

            // Title Bar
            'titleBar.activeBackground': '#3c3c3c',
            'titleBar.activeForeground': '#cccccc',
            'titleBar.inactiveBackground': '#3c3c3c',

            // Tabs
            'tab.activeBackground': '#1e1e1e',
            'tab.inactiveBackground': '#2d2d2d',
            'tab.activeForeground': '#ffffff',
            'tab.inactiveForeground': '#969696',
            'tab.border': '#252526',

            // Panel
            'panel.background': '#1e1e1e',
            'panel.border': '#80808059',
            'panelTitle.activeBorder': '#007acc',

            // Terminal
            'terminal.background': '#1e1e1e',
            'terminal.foreground': '#cccccc',

            // Buttons
            'button.background': '#0e639c',
            'button.foreground': '#ffffff',
            'button.hoverBackground': '#1177bb',

            // Input
            'input.background': '#3c3c3c',
            'input.border': '#3c3c3c',
            'input.foreground': '#cccccc',

            // Dropdown
            'dropdown.background': '#3c3c3c',
            'dropdown.border': '#3c3c3c',

            // List
            'list.activeSelectionBackground': '#094771',
            'list.activeSelectionForeground': '#ffffff',
            'list.hoverBackground': '#2a2d2e',
            'list.inactiveSelectionBackground': '#37373d',

            // Badge
            'badge.background': '#007acc',
            'badge.foreground': '#ffffff',
        }
    },

    light: {
        name: "Light+ (default light)",
        type: "light",
        colors: {
            // Editor
            'editor.background': '#ffffff',
            'editor.foreground': '#000000',
            'editor.lineHighlightBackground': '#f0f0f0',
            'editor.selectionBackground': '#add6ff',

            // Sidebar
            'sideBar.background': '#f3f3f3',
            'sideBar.foreground': '#616161',
            'sideBar.border': '#e5e5e5',

            // Activity Bar
            'activityBar.background': '#2c2c2c',
            'activityBar.foreground': '#ffffff',
            'activityBar.activeBorder': '#007acc',

            // Status Bar
            'statusBar.background': '#007acc',
            'statusBar.foreground': '#ffffff',

            // Title Bar
            'titleBar.activeBackground': '#dddddd',
            'titleBar.activeForeground': '#333333',

            // Tabs
            'tab.activeBackground': '#ffffff',
            'tab.inactiveBackground': '#ececec',
            'tab.activeForeground': '#333333',
            'tab.inactiveForeground': '#6b6b6b',
            'tab.border': '#e5e5e5',

            // Panel
            'panel.background': '#ffffff',
            'panel.border': '#e5e5e5',
            'panelTitle.activeBorder': '#007acc',

            // Terminal
            'terminal.background': '#ffffff',
            'terminal.foreground': '#333333',

            // Buttons
            'button.background': '#007acc',
            'button.foreground': '#ffffff',
            'button.hoverBackground': '#005a9e',

            // Input
            'input.background': '#ffffff',
            'input.border': '#cecece',
            'input.foreground': '#333333',

            // Dropdown
            'dropdown.background': '#ffffff',
            'dropdown.border': '#cecece',

            // List
            'list.activeSelectionBackground': '#0060c0',
            'list.activeSelectionForeground': '#ffffff',
            'list.hoverBackground': '#e8e8e8',
            'list.inactiveSelectionBackground': '#e4e6f1',

            // Badge
            'badge.background': '#007acc',
            'badge.foreground': '#ffffff',
        }
    }
};

export function getThemeColor(theme, key) {
    return themes[theme]?.colors[key] || '#000000';
}

export function getMonacoTheme(theme) {
    return theme === 'dark' ? 'vs-dark' : 'light';
}
