import { JSX } from "react";

export enum Page {
	FINDER = 'finder',
	COMPANY = 'company',
	ANALYZE = 'analyze'
  }
  
  export type PageType = {
	id: Page;
	title: string;
	component: JSX.Element;
  };