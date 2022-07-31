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
			</button>
		</div>
	);
};