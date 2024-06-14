# V1.0.4
- NEW Feature! Now LAB supports Folders inside main working directory


# V1.0.3
- Refactored controlling system. Now Running scripts is done by clicking on "Run Script" button.

# LAB Scripter

LAB Scripter is a VS Code extension that allows you to manage and execute PowerShell scripts directly from the VS Code explorer. This extension enables quick execution of scripts with a left-click and easy editing with a right-click context menu option.

## Features

- **Execute Scripts**: Left-click on a script in the LAB Scripter view to run it.
- **Edit Scripts**: Right-click on a script and select "Edit Script" to open it for editing in VS Code.
- **Customizable Script Path**: Configure the path to your scripts directory in the extension settings.

## Installation

1. Clone or download this repository.
2. Open the folder in VS Code.
3. Run `npm install` to install the necessary dependencies.
4. Open the command palette (Ctrl+Shift+P) and select `Developer: Install Extension from Location`, then choose the folder of this extension.
5. Reload VS Code.

## Configuration

You can configure the path to your PowerShell scripts directory in the extension settings.

1. Open the settings (File > Preferences > Settings or Ctrl+,).
2. Search for `lab.scriptsPath`.
3. Set the path to your desired scripts directory. If not set, it defaults to `C:\Users\<YourUsername>\AppData\Roaming\LAB\Scripts`.

## Usage

1. Open the LAB Scripter view in the VS Code explorer.
2. The view will display all scripts located in the configured scripts directory.
3. Left-click on a script to execute it.
4. Right-click on a script and select "Edit Script" to open it for editing.

## Development

To work on the extension, follow these steps:

1. Clone the repository.
2. Open the folder in VS Code.
3. Run `npm install` to install dependencies.
4. Make your changes to the extension.
5. Compile the extension using `npm run compile`.
6. Test the extension using `npm run watch` and run the extension in a new VS Code window (F5).

## Commands

- `lab.runScript`: Executes the selected PowerShell script.
- `lab.editScript`: Opens the selected PowerShell script for editing.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Thanks to the VS Code team for creating such an extensible and powerful editor.
