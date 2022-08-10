import React from "react";

export const Nav: React.FC = () => {
	return (
		<div>
			<button 
				onClick={() => {
					window.location.href = "/app" 
				}}
			>
				Home 🏡
			</button><button 
				onClick={() => {
					window.location.href = "/app/vote" 
				}}
			>
				Vote 🗳
			</button><button 
				onClick={() => {
					window.location.href = "/app/logout" 
				}}
			>
				Settings ⚙️
			</button>

		</div>
	);
};