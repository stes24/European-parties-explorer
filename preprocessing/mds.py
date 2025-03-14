import matplotlib.pyplot as plt
from sklearn.impute import SimpleImputer
from sklearn.manifold import MDS
from sklearn import preprocessing
import pandas

# Only columns needed for dimensionality reduction
attributes = ['eu_position', 'eu_intmark', 'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation', 'redistribution',
              'civlib_laworder', 'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism', 'urban_rural',
              'environment', 'regions', 'ethnic_minorities', 'nationalism']

merged_df = pandas.read_csv('../public/merged_dataset.csv', na_values=[''], keep_default_na=False)
print('\nTOTAL VALUES:', len(merged_df), '\nTotal missing values for each attribute:\n', merged_df.isna().sum(), '\n')

# Prepare new columns for MDS results
merged_df['mds1'] = None
merged_df['mds2'] = None

years = [1999, 2002, 2006, 2010, 2014, 2019, 2024]
for year in years:
    # From the whole dataset, take only the year we're using and only the attributes needed for dimensionality reduction
    df_year = merged_df[merged_df['year'] == year].reset_index(drop=True)  # Reset index to avoid problems with data alignment
    df_year = df_year[attributes]
    
    # Drop columns where at least one third of rows have no data in that column
    threshold = 0.333
    missing_values_count = df_year.isna().sum()    # Check number of missing values for each column
    print(year, '- VALUES:', len(df_year), '\nMissing values for each attribute:\n', missing_values_count, '\n')
    df_year = df_year.loc[:, missing_values_count / len(df_year) < threshold]    # Selects all rows, then columns below threshold
    print(year, '- VALUES:', len(df_year), '\nMissing values AFTER THRESHOLD:\n', df_year.isna().sum(), '\n')
    
    # Insert median for remaining missing values
    imputer = SimpleImputer(strategy='median')
    df_year = imputer.fit_transform(df_year)
    
    std_scale = preprocessing.StandardScaler()      # Standardize data - same mean/deviation
    data = std_scale.fit_transform(df_year)         # Apply standardization
    
    # Apply MDS
    mds = MDS(normalized_stress='auto', random_state=64)
    points = mds.fit_transform(data)        # Coordinates of computed points
    
    # Plot inside Python
    plt.scatter(points[:, 0], points[:, 1])
    plt.xlabel('MDS dimension 1')
    plt.ylabel('MDS dimension 2')
    plt.show()
    
    # Add new coordinates to the original dataset
    merged_df.loc[merged_df['year'] == year, 'mds1'] = points[:, 0]
    merged_df.loc[merged_df['year'] == year, 'mds2'] = points[:, 1]

merged_df.to_csv('../public/merged_dataset_with_mds.csv', index=False)