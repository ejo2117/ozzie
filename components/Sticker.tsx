import { ReactElement, JSXElementConstructor, ReactFragment, ReactPortal } from 'react';
import styles from './Sticker.module.scss';
const Sticker = (props: {
	children:
		| string
		| number
		| boolean
		| ReactElement<any, string | JSXElementConstructor<any>>
		| ReactFragment
		| ReactPortal
		| null
		| undefined;
}) => {
	return <div className={styles.container}>{props.children}</div>;
};

export default Sticker;
