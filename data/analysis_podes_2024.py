"""
Reproducible core analysis for PODES 2024.
Input: PODES_2024_MASTER_READY.csv
Methods: EDA, StandardScaler, PCA, KMeans validation k=2..8, Mahalanobis outliers.
"""
import csv, numpy as np
from scipy.stats import chi2
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score

VARS = [
    "pct_bts","pct_4g5g","pct_public_transport","pct_market_access",
    "pct_permanent_market","pct_bank_access","pct_kur","pct_leading_product"
]

with open("PODES_2024_MASTER_READY.csv", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))

X = []
complete = []
for r in rows:
    vals = []
    ok = True
    for v in VARS:
        if r[v] == "":
            ok = False
            break
        vals.append(float(r[v]))
    if ok:
        X.append(vals)
        complete.append(r)

X = np.asarray(X, dtype=float)
Z = StandardScaler().fit_transform(X)

pca = PCA().fit(Z)
scores = pca.transform(Z)
print("Explained variance:", pca.explained_variance_ratio_)
print("PC1+PC2:", pca.explained_variance_ratio_[:2].sum())

for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=50, random_state=42)
    labels = km.fit_predict(Z)
    print(
        k,
        silhouette_score(Z, labels),
        calinski_harabasz_score(Z, labels),
        davies_bouldin_score(Z, labels)
    )

km = KMeans(n_clusters=3, n_init=50, random_state=42)
labels = km.fit_predict(Z)

cov = np.cov(Z, rowvar=False)
inv_cov = np.linalg.inv(cov)
md2 = np.einsum("ij,jk,ik->i", Z, inv_cov, Z)
threshold = chi2.ppf(0.99, df=len(VARS))
print("Mahalanobis threshold:", threshold)
print("Outliers:", int((md2 > threshold).sum()))
