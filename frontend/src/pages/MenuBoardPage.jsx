// use state to store data to be displayed
// use effect to run when page initially loads
import{ useEffect, useState } from "react"; 

import{ fetchMenu } from "../services/api"; //import api func to load menu items from db

export default function MenuBoardPage(){
	const [menu, setMenu] = useState([]); //store menu items by category

	useEffect(() => { //fetch menu on page loading
		fetchMenu().then((items) => {
			setMenu(items); //saves menu items into setMenu
		});
	}, []);
	
	return(
		<div>
			<h1>Reveille Bubble Tea Menu</h1>
			{menu.map((menuItem) => ( //loop through every menuItem and display info
				// key will differentiate each item by their id 
				<div key={menuItem.menu_item_id}>
					<h2>{menuItem.name}</h2>
					<p>{menuItem.description}</p>
					
					{/* round price to 2 decimal points */} 
					<p>${parseFloat(menuItem.base_price).toFixed(2)}</p>
				</div>	
			))}

		</div>
	);
}
