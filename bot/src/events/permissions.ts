import { ApplicationCommandPermissionData, ApplicationCommandResolvable } from "discord.js";

const permissionDev: ApplicationCommandPermissionData[] = [{
    id: '954596696879427644',
    type: 'ROLE',
    permission: true,
}]

const buyRamBytesDev: ApplicationCommandResolvable = '950848169019850824'
const createAcctDev: ApplicationCommandResolvable = "949100831792320612"
const addPermDev: ApplicationCommandResolvable = "949100831792320613"
const treasuryBalDev: ApplicationCommandResolvable = "949099670515376139"

export const BuyRamBytesDev: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
		command: buyRamBytesDev,
		permissions: permissionDev,
    }
export const CreateAcctDev: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
		command: createAcctDev,
		permissions: permissionDev,
	}
export const AddPermDev: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
		command: addPermDev,
		permissions: permissionDev,
    }
export const TreasuryBalDev: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
		command: treasuryBalDev,
		permissions: permissionDev,
	}

// const fullPermissionsDev = [
// 	{
//         // buyrambytes
// 		id: '950848169019850824',
// 		permissions: [{
// 			id: '954596696879427644',
// 			type: 'ROLE',
// 			permission: true,
// 		}],
// 	},
// 	{
//         // creatacct
// 		id: '949100831792320612',
// 		permissions: [{
// 			id: '954596696879427644',
// 			type: 'ROLE',
// 			permission: true,
// 		}],
// 	},
//     {
//         // addperm
// 		id: '949100831792320613',
// 		permissions: [{
// 			id: '954596696879427644',
// 			type: 'ROLE',
// 			permission: true,
// 		}],
// 	},
//     {
//         // treasurybal
// 		id: '949099670515376139',
// 		permissions: [{
// 			id: '954596696879427644',
// 			type: 'ROLE',
// 			permission: true,
// 		}],
// 	},
	// {
	//     // treasurybal
	// 	id: '949099670515376139',
	// 	permissions: [{
	// 		id: '954596696879427644',
	// 		type: 'ROLE',
	// 		permission: true,
	// 	}],
	// },
// ]