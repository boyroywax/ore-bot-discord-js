import { CommandInt } from "../interfaces/CommandInt";
import { help } from "./help";
import { login } from "./login"
import { logout } from './logout'

export const CommandList: CommandInt[] = [ help, login, logout ];