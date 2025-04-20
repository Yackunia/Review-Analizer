import "./ContainersStyles.css"
 

export default function CardContainer({children, width = '1200px', minWidth, height, onClick}) {
	let st = {}
	st["max-width"] = width

	if (height)
		st["max-height"] = height

	if (minWidth)
		st["min-width"] = minWidth
	
	return (	
	  <div className="container-card" onClick={onClick} style={st}>
		{children}
	  </div>
	);
  }