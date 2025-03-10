import matplotlib.pyplot as plt
from sklearn.manifold import MDS
from sklearn import preprocessing
import pandas

# WILL HAVE TO REPEAT ALL OPERATIONS FOR EACH YEAR
attributes = ['eu_position', 'party_id', 'family', 'sociallifestyle']

# Use only numerical data and data from 2019
df = pandas.read_csv('../public/merged_dataset.csv')
df = df[df['year'] == 2019].reset_index(drop=True)  # Used to reinsert some columns later
df_to_reduce = df[attributes]

std_scale = preprocessing.StandardScaler()      # Standardize data - same mean/deviation
data = std_scale.fit_transform(df_to_reduce)    # Apply standardization

mds = MDS(normalized_stress='auto', random_state=64)
points = mds.fit_transform(data)

plt.scatter(points[:,0], points[:,1])
plt.xlabel('MDS dimension 1')
plt.ylabel('MDS dimension 2')
plt.show()

# Add original columns back for later coloring and selecting points on the scatter plot
df_out = pandas.DataFrame(points, columns=['mds1', 'mds2'])
df_out['country'] = df['country']
df_out['party_id'] = df['party_id']
df_out['party'] = df['party']
df_out['vote'] = df['vote']
df_out['seat'] = df['seat']
df_out['family'] = df['family']
df_out.to_csv('../public/merged_dataset_mds_2019.csv', index=False)