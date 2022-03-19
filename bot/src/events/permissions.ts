import { ApplicationCommandPermissionData, ApplicationCommandResolvable } from "discord.js";

const permissionDev: ApplicationCommandPermissionData[] = [{
    id: '954596696879427644',
    type: 'ROLE',
    permission: true,
}]

const buyRamBytes: ApplicationCommandResolvable = '950848169019850824'
const createAcct: ApplicationCommandResolvable = "949100831792320612"
const addPerm: ApplicationCommandResolvable = "949100831792320613"
const treasuryBal: ApplicationCommandResolvable = "949099670515376139"

export const BuyRamBytes: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
        // buyrambytes
		command: buyRamBytes,
		permissions: permissionDev,
    }
export const CreateAcct: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
		command: createAcct,
		permissions: permissionDev,
	}
export const AddPerm: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
        // buyrambytes
		command: addPerm,
		permissions: permissionDev,
    }
export const TreasuryBal: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
		command: treasuryBal,
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