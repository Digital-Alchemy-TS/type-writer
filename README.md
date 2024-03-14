## 📝 Description

Welcome to `@digital-alchemy/type-writer`!

This application is a support tool for `@digital-alchemy/hass`, providing a detailed description of your setup for your editor to take advantage of. This is strictly a development tool, aimed at enhancing the editor experience.
Get detailed information about services, which entities are available (or not), and more!

This script should be run after updating dependencies, any time you alter your setup, right before you open your editor, or whenever you feel like it. Nobody is judging.

![editor](./docs/editor.png)
## 🚀 Usage
```bash
# install to devDependencies
npm i --save-dev @digital-alchemy/type-writer
# run
npx type-writer
```
![command](./docs/command.png)

If you are running your code within a Home Assistant addon environment, `type-writer` will automatically connect to your install. No configuration needed!

## ⚙️ Configuration

For setups outside an addon environment, a configuration file is needed. Create one of the following:
- `.type_writer`: add to project root
- `~/.config/type_writer`: add to user configs

**Contents:**
```ini
[hass]
  BASE_URL=http://localhost:8123
  TOKEN=... # YOUR LONG LIVED ACCESS TOKEN
```
