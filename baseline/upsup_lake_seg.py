import numpy as np
from k_means_test import k_means
from plot_em import plot_results
import matplotlib.pyplot as plt
from matplotlib.image import imread
import scipy.ndimage
from sklearn.cluster import KMeans, DBSCAN
from sklearn.mixture import BayesianGaussianMixture, GaussianMixture

# Hyper params
image_path = 'images/Russia_7_2017.png'  # image path
n_clusters = 3  # 3 clusters gives a little bit more robustness
target_blue = np.array([0., 0., 0.])  # used to determine which cluster is the lake and which one is land...

# DBSCAN hyperparams
eps = 2
min_samples = 5
percentile = 80

# EM hyperparams
gamma = 1
rho = 2
n_components = 8  # len(arg_labels)*2
cov_ratio = 2  # ratio of diagonal covariance matrix entries


# load image to numpy array
image = imread(image_path)
image_kmeans = scipy.ndimage.interpolation.zoom(image, (0.5, 0.5, 1.0))

# print(image.dtype, image.shape, np.max(image))
# print(image_kmeans.dtype, image_kmeans.shape, np.max(image_kmeans))

# flatten image
image_flat = image_kmeans.reshape((-1, 3))

# initialize sklearn kmeans
kmeans = KMeans(n_clusters=n_clusters, max_iter=900, random_state=7).fit(image_flat)
labels = kmeans.predict(image_flat)
# import pdb; pdb.set_trace()

centers = labels.reshape(image_kmeans.shape[:2])

cluster_centers = kmeans.cluster_centers_
target_label = np.argmin(np.linalg.norm(cluster_centers-target_blue, axis=-1))

data = np.argwhere(centers == target_label)

# DBSCAN portion
print('dbscan')
db = DBSCAN(eps=eps, min_samples=min_samples)
db_labels = db.fit_predict(data)

db_data = data[db_labels != -1]
db_labels = db_labels[db_labels != -1]

bins = np.bincount(db_labels)
bin_perc = np.percentile(bins, percentile)

arg_labels = np.argwhere(bins >= bin_perc)
db_data2 = np.array([d for d, l in zip(db_data, db_labels) if l in arg_labels])


# import pdb; pdb.set_trace()
# BAYESIAN EM section
print('EM')
nc_array = np.arange(n_components)+1
em_data = []
for m, label in enumerate(arg_labels):
    label_data = db_data[db_labels==label]

    # log_acc = np.zeros(nc_array.shape)
    # dpgmm_list = []
    # for i in range(len(nc_array)):
    #     dp = GaussianMixture(n_components=nc_array[i], covariance_type='full', max_iter=10000, verbose=0)
    #     dp.fit(label_data)
    #
    #     dpgmm_list.append(dp)
    #     log_acc[i] = dp.lower_bound_ - nc_array[i]/rho
    #
    # dpgmm = dpgmm_list[np.argmax(log_acc)]
    # print(len(dpgmm.covariances_), log_acc)

    dpgmm = BayesianGaussianMixture(n_components=n_components, covariance_type='full', max_iter=50000,
                                    weight_concentration_prior_type='dirichlet_process', mean_precision_prior=.8,
                                    weight_concentration_prior=gamma, n_init=1, init_params='random', reg_covar=1e-6)

    # gmm_labels = dpgmm.predict(label_data)
    gmm_labels = dpgmm.fit_predict(label_data)
    # print('Variational', max(gmm_labels)+1)

    for k, cov in enumerate(dpgmm.covariances_):
        c1, c2 = np.diag(cov)
        if c1/c2 < cov_ratio and c2/c1 < cov_ratio:
            em_data.extend(label_data[gmm_labels == k])
            # import pdb; pdb.set_trace()

    if np.mod(m, 10) == 0:
        print('cluster {} out of {}'.format(m, len(arg_labels)))

    # plot_results(label_data, gmm_labels, dpgmm.means_, dpgmm.covariances_)
    # plt.show()


print(len(em_data))
em_data = np.array(em_data)
# import pdb; pdb.set_trace()

# print(target_label)
# plt.imshow(centers)
plt.figure()
plt.imshow(image_kmeans)
# plt.figure()
# plt.plot(data[:,1], data[:,0], ',')
# plt.gca().invert_yaxis()
plt.figure()
plt.plot(db_data2[:,1], db_data2[:,0], ',')
plt.gca().invert_yaxis()

plt.figure()
plt.plot(em_data[:,1], em_data[:,0], ',')
plt.gca().invert_yaxis()

# plot_results(label_data, gmm_labels, dpgmm.means_, dpgmm.covariances_)
plt.show()
# import pdb; pdb.set_trace()

