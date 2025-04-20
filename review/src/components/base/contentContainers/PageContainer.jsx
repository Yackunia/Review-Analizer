import "./ContainersStyles.css"

export default function PageContainer({ children }) {
	return (
		<div className="page_container">
			{...children}
		</div>
	)
}
