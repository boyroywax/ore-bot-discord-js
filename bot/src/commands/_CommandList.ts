import { CommandInt } from "../interfaces/CommandInt";
import { help } from "./help";
import { login } from "./login"

export const CommandList: CommandInt[] = [login, help];