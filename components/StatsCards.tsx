import React from 'react';
import styles from './StatsCards.module.css';

interface Stats {
  datasetCount: number;
  organizationCount: number;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.icon}>📊</span>
        <div>
          <h2>Datasets</h2>
          <p>{stats.datasetCount.toLocaleString()} available</p>
        </div>
      </div>
      <div className={styles.card}>
        <span className={styles.icon}>🏢</span>
        <div>
          <h2>Organizations</h2>
          <p>{stats.organizationCount.toLocaleString()} publishers</p>
        </div>
      </div>
    </div>
  );
}
