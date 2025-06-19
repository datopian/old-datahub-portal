import styles from './SearchBar.module.css';

export default function SearchBar() {
  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Find datasets by keyword, topic, or publisher"
        className={styles.input}
        disabled
      />
    </div>
  );
}
