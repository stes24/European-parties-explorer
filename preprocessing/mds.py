import matplotlib.pyplot as plt
from sklearn.impute import SimpleImputer
from sklearn.manifold import MDS
from sklearn import preprocessing
import pandas

# WILL HAVE TO REPEAT ALL OPERATIONS FOR EACH YEAR
attributes = ['eu_position', 'eu_intmark', 'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation', 'redistribution',
              'civlib_laworder', 'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism', 'urban_rural',
              'environment', 'regions', 'ethnic_minorities', 'nationalism']

df_all_years = pandas.read_csv('../public/merged_dataset.csv', na_values=[''], keep_default_na=False)
print('\nTOTAL VALUES:', len(df_all_years), '\nTotal missing values for each attribute:\n', df_all_years.isna().sum(), '\n')

years = [1999, 2002, 2006, 2010, 2014, 2019, 2024]
for year in years:
    df_year = df_all_years[df_all_years['year'] == year].reset_index(drop=True)  # Reset index to reinsert some columns later
    df_to_reduce = df_year[attributes]          # Dataset with only data needed for dimensionality reduction
    
    # Drop columns where at least one third of rows have no data in that column
    threshold = 0.333
    missing_values_count = df_to_reduce.isna().sum()    # Check number of missing values for each column
    print(year, '- VALUES:', len(df_to_reduce), '\nMissing values for each attribute:\n', missing_values_count, '\n')
    df_to_reduce = df_to_reduce.loc[:, missing_values_count / len(df_to_reduce) < threshold]    # Selects all rows, then columns below threshold
    print(year, '- VALUES:', len(df_to_reduce), '\nMissing values AFTER THRESHOLD:\n', df_to_reduce.isna().sum(), '\n')
    
    # Insert median for remaining missing values
    imputer = SimpleImputer(strategy='median')
    df_to_reduce = imputer.fit_transform(df_to_reduce)
    
    std_scale = preprocessing.StandardScaler()      # Standardize data - same mean/deviation
    data = std_scale.fit_transform(df_to_reduce)    # Apply standardization
    
    # Apply MDS
    mds = MDS(normalized_stress='auto', random_state=64)
    points = mds.fit_transform(data)
    
    # Plot inside Python
    plt.scatter(points[:,0], points[:,1])
    plt.xlabel('MDS dimension 1')
    plt.ylabel('MDS dimension 2')
    plt.show()
    
    # Add original columns back for later coloring and selecting points on the scatter plot
    df_out = pandas.DataFrame(points, columns=['mds1', 'mds2'])
    df_out['country'] = df_year['country']
    df_out['party_id'] = df_year['party_id']
    df_out['party'] = df_year['party']
    df_out['vote'] = df_year['vote']
    df_out['seat'] = df_year['seat']
    df_out['epvote'] = df_year['epvote']
    df_out['family'] = df_year['family']
    df_out.to_csv(f'../public/merged_dataset_mds_{year}.csv', index=False)