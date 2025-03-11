import matplotlib.pyplot as plt
from sklearn.impute import SimpleImputer
from sklearn.manifold import MDS
from sklearn import preprocessing
import pandas

# WILL HAVE TO REPEAT ALL OPERATIONS FOR EACH YEAR
attributes = ['eu_position', 'eu_intmark', 'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation', 'redistribution',
              'civlib_laworder', 'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism', 'urban_rural',
              'environment', 'regions', 'ethnic_minorities', 'nationalism', 'russian_interference', 'anti_islam_rhetoric']

# Use only numerical data and data from 2019
df = pandas.read_csv('../public/merged_dataset.csv')
print(df[attributes].isna().sum())      # Number of missing values in whole dataset
df = df[df['year'] == 2019].reset_index(drop=True)  # Reset index to reinsert some columns later
df_to_reduce = df[attributes]

# Drop columns where at least one third of rows have no data in that column
threshold = 0.333
missing_values_count = df_to_reduce.isna().sum()    # Check number of missing values for each column
df_to_reduce = df_to_reduce.loc[:, missing_values_count / len(df_to_reduce) < threshold]    # Selects all rows, then columns below threshold
print(df_to_reduce.isna().sum())

# Insert median for remaining missing values
imputer = SimpleImputer(strategy='median')
df_to_reduce = imputer.fit_transform(df_to_reduce)

std_scale = preprocessing.StandardScaler()      # Standardize data - same mean/deviation
data = std_scale.fit_transform(df_to_reduce)    # Apply standardization

# Apply MDS
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