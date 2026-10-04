-- keymaps.lua
-- Global keymaps. This file contains only key bindings.
-- All non-trivial logic lives in actions.lua (or other modules).

local actions = require("actions")
local map = vim.keymap.set

require("core_keymaps").setup()

map("n", "<leader>fm", actions.format_document, { desc = "Format document" })
map("n", "<leader>fe", actions.open_in_explorer, { desc = "Open in Windows Explorer" })
map("n", "<leader>ld", actions.toggle_lazydocker, { desc = "Toggle lazydocker" })
map("n", "<leader>gw", actions.open_difit, { desc = "Open difit (select base branch)" })
map("n", "<leader>gW", actions.stop_difit, { desc = "Stop difit" })
