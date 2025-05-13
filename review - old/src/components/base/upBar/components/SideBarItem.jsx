import classes from "./SideBarItem.module.css";

export default function SideBarItem({ children, isActive, onClick, isSubItem }) {
    return (
        <div
            className={`${classes.sidebar_item} ${isActive ? classes.sidebar_item_active : ""} 
                ${isSubItem ? classes.sidebar_subitem : ""}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
