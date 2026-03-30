// use state to store data to be displayed
// use effect to run when page initially loads
import{ useEffect, useState } from "react"; 

import{ fetchMenu } from "../services/api"; //import api func to load menu items from db

export default function MenuBoardPage(){
	const [menu, setMenu] = useState([]); //store menu items by category

	useEffect(() => { //fetch menu on page loading
		fetchMenu().then((items) => {
			console.log("Fetched items:", items);
			setMenu(items); //saves menu items into setMenu
		}).catch(err => {
			console.error("Fetch failed:", err);
		});
	}, []);
	
	return(
		<div id = "center"> 
			<h1 className = "hero">Reveille Bubble Tea Menu</h1>
				{/* grid layout*/}
			<div id = "next-steps" style = {{ flexWrap: 'wrap', border: 'none'}}>
				{menu.map((menuItem) => ( //loop through every menuItem and display info
					/* key will differentiate each item by their id*/ 
					<div key={menuItem.menu_item_id} id="docs" style = {{minWidth: '300px', flex: '1 1 300px'}}>
						<h2>{menuItem.name}</h2>
						<p>{menuItem.description}</p>
					
						{/* round price to 2 decimal points */} 
						<span className = "counter">
							${parseFloat(menuItem.base_price).toFixed(2)}
						</span>
					</div>	
				
				))}
			</div>
		</div>
	);
}
