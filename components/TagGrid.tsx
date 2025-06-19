import React from 'react';
import styles from './TagGrid.module.css';

interface Tag {
  id: string;
  label: string;
}

export default function TagGrid({ tags }: { tags: Tag[] }) {
  return (
    <div>
      <h2>Browse by Popular Tags</h2>
      <div className={styles.grid}>
        {tags.map((tag) => (
          <div key={tag.id} className={styles.card}>
            <h3>{tag.id}</h3>
            <p>{tag.label}</p>
            <a className={styles.button} href={`/search?tag=${tag.id}`}>View</a>
          </div>
        ))}
      </div>
    </div>
  );
}
