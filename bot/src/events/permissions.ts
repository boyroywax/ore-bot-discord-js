import { ApplicationCommandPermissionData, ApplicationCommandResolvable } from "discord.js";

const permissionDev: ApplicationCommandPermissionData[] = [{
    id: '954596696879427644',
    type: 'ROLE',
    permission: true,
}]

const buyRamBytesDev: ApplicationCommandResolvable = '955633204658864171'
const createAcctDev: ApplicationCommandResolvable = "955633204658864169"
const addPermDev: ApplicationCommandResolvable = "949100831792320613"
const treasuryBalDev: ApplicationCommandResolvable = "955633204658864168"
const stakeResourcesDev: ApplicationCommandResolvable = '955633204658864172'

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
export const StakeResourcesDev: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
	command: stakeResourcesDev,
	permissions: permissionDev,
	}


const permissionProd: ApplicationCommandPermissionData[] = [{
	id: '955564645404532816',
	type: 'ROLE',
	permission: true
}]

const buyRamBytes: ApplicationCommandResolvable = '955557058520961111'
const createAcct: ApplicationCommandResolvable = "955557058520961109"
const addPerm: ApplicationCommandResolvable = "955557058520961110"
const treasuryBal: ApplicationCommandResolvable = "955557058520961108"
const stakeResources: ApplicationCommandResolvable = '955594911980331008'

export const BuyRamBytes: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
	command: buyRamBytes,
	permissions: permissionProd,
    }
export const CreateAcct: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
	command: createAcct,
	permissions: permissionProd,
	}
export const AddPerm: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
	command: addPerm,
	permissions: permissionProd,
    }
export const TreasuryBal: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
	command: treasuryBal,
	permissions: permissionProd,
	}
export const StakeResources: { command: ApplicationCommandResolvable; } & { permissions: ApplicationCommandPermissionData[]; } =  {
	command: stakeResources,
	permissions: permissionProd,
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