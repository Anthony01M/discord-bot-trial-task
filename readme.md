# Discord Bot Trial Task

This project is an advanced Discord bot designed to handle comprehensive slash commands, robust user interaction, enhanced role management, data management, and moderation tools.

## Features

### Advanced Command Handling
- **Echo Command (/echo):**
  - Repeats the input message with a maximum of 500 characters.
  - Displays both the original and reversed versions of the message.
  - Includes stringent input sanitization to prevent potential command injections and formatting issues.

### Advanced Role Management
- **Assign Role Command (/assignrole):**
  - Assigns a specified role based on predefined server-specific criteria (e.g., user has a message count above 1000 or membership duration exceeds 30 days).
  - Verifies that the bot has the necessary permissions before executing the role assignment.
- **Remove Role Command (/removerole):**
  - Confirms the action before executing and allows for optional input of the reason.
  - Supports temporary role removals with automatic restoration after a set period.

## Technologies Used

- JavaScript
- Discord.js
- pnpm

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```sh
    cd <repository-directory>
    ```
3. Install dependencies using pnpm:
    ```sh
    pnpm install
    ```
4. Edit `config.json` file in the root directory with your bot token and database credentials.
5. Start the bot:
    ```sh
    node server.js
    ```

## Usage

- Use `/echo [message]` to repeat the input message with both original and reversed versions.
- Use `/assignrole [@user] [role] (messages) (since)` to assign a role based on criteria (amount of messages and/or since X seconds/minutes/hours/days/etcetera).
- Use `/removerole [@user] [role] (reason) (duration)` to remove a role with optional reason and temporary removal.

### Note
- [] - Required argument
- () - Optional argument 

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This project is part of my job trial tasks. Feel free to check out my other projects on [GitHub](https://github.com/Anthony01M).