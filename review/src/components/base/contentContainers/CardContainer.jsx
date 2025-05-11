import "./ContainersStyles.css"
 

export default function CardContainer({children, width = '1200px', minWidth, height, onClick}) {
	let st = {}
	st["maxWidth"] = width

	if (height)
		st["maxHeight"] = height

	if (minWidth)
		st["minWidth"] = minWidth
	
	return (	
	  <div className="container-card" onClick={onClick} style={st}>
		{children}
	  </div>
	);
  }
