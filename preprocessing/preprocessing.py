import pandas

# Filter columns from 1999-2019 dataset
df1 = pandas.read_csv('../public/dataset_1999.csv', na_values=[''], keep_default_na=False)  # Interpret only ,, as missing values
columns_to_keep1 = ['country', 'year', 'party_id', 'party', 'vote', 'seat', 'epvote', 'family', 'eu_position', 'eu_intmark',
                   'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation', 'redistribution', 'civlib_laworder',
                   'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism', 'environment',
                   'regions', 'ethnic_minorities', 'nationalism']
df1 = df1[columns_to_keep1]
df1.to_csv('../public/dataset_1999_filtered.csv', index=False)
print('1999-2019: filtered columns')

# Filter columns from 2024 dataset and make it coherent to the 1999-2019 dataset
df2 = pandas.read_csv('../public/dataset_2024.csv', na_values=[''], keep_default_na=False)
df2['year'] = 2024                                                              # Insert survey year
df2['sociallifestyle'] = (df2['womens_rights'] + df2['lgbtq_rights']) / 2       # sociallifestyle is not defined in 2024 dataset
columns_to_keep2 = ['country',  'year', 'party_id', 'party', 'vote', 'seatperc', 'epvote', 'family', 'eu_position', 'eu_intmark',
                   'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation', 'redistribution', 'civlib_laworder',
                   'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism', 'environment',
                   'regions', 'ethnic_minorities', 'nationalism']
df2 = df2[columns_to_keep2]
df2.rename(columns = {'seatperc': 'seat'}, inplace=True)        # Same name as 1999-2019 dataset
# Use numbers like 1999-2019 dataset
df2['country'] = df2['country'].replace({
    'be': 1, 'dk': 2, 'ge': 3, 'gr': 4, 'esp': 5, 'fr': 6, 'irl': 7, 'it': 8, 'nl': 10,
    'uk': 11, 'por': 12, 'aus': 13, 'fin': 14, 'sv': 16, 'bul': 20, 'cz': 21, 'est': 22,
    'hun': 23, 'lat': 24, 'lith': 25, 'pol': 26, 'rom': 27, 'slo': 28, 'sle': 29,
    'cro': 31, 'tur': 34, 'nor': 35, 'swi': 36, 'mal': 37, 'lux': 38, 'cyp': 40, 'ice': 45
    # lux actually not in the 2024 dataset - tur, nor, swi, mal, lux and ice will be removed anyway
})
df2['family'] = df2['family'].replace({
    'radrt': 1,
    'con': 2,
    'lib': 3,
    'cd': 4,
    'soc': 5,
    'radleft': 6,
    'green': 7,
    'reg': 8,
    'nofamily': 9,
    'confessional': 10,
    'agrarian/centre': 11
})
df2.to_csv('../public/dataset_2024_filtered.csv', index=False)
print('2024: added year and sociallifestyle, filtered and renamed columns, renamed countries and families as numbers')

# Merge files
merged_df = pandas.concat([df1, df2], ignore_index=True)
merged_df.sort_values(['country', 'year'], inplace=True)        # Reorder 2024 data (keep overall ordering by country and year)
print('Merged datasets')

# DEBUGGING - Check number of missing values
print('\nTOTAL ROWS:', len(merged_df), '\nTotal missing values for each attribute:\n', merged_df.isna().sum(), '\n')
years = [1999, 2002, 2006, 2010, 2014, 2019, 2024]
for year in years:      # Missing values for each year (remember some attributes are not in all years)
    df_year = merged_df[merged_df['year'] == year].reset_index(drop=True)    
    print(year, '- ROWS:', len(df_year), '\nMissing values for each attribute:\n', df_year.isna().sum(), '\n')

# Remove countries with too little data
merged_df = merged_df[~merged_df['country'].isin([34, 35, 36, 37, 38, 45])]     # Tilde inverts the result
# tur, nor, swi, ice: no EU - mal: too much missing data in 2024, only two parties
# lux: too much missing data, no 2024 data

merged_df[['vote', 'seat', 'epvote']] = merged_df[['vote', 'seat', 'epvote']].fillna(0)     # Missing votes become 0%
merged_df[['vote', 'seat', 'epvote']] = merged_df[['vote', 'seat', 'epvote']].round(3)      # Use three decimal digits

# Delete rows with missing values - consider different sets of columns for each year
columns_to_ignore = {
    1999: ['eu_intmark', 'spendvtax', 'deregulation', 'redistribution', 'civlib_laworder', 'sociallifestyle', 'religious_principles',
           'immigrate_policy', 'multiculturalism', 'environment', 'regions', 'ethnic_minorities', 'nationalism'],
    2002: ['spendvtax', 'deregulation', 'redistribution', 'civlib_laworder', 'sociallifestyle', 'religious_principles',
           'immigrate_policy', 'multiculturalism', 'environment', 'regions', 'ethnic_minorities', 'nationalism'],
    2006: ['environment', 'nationalism'],
    2010: ['nationalism'],
    2014: [],
    2019: [],
    2024: []
}

def delete_nulls(df, year, columns_to_ignore):
    df_year = df[df['year'] == year].copy()     # Take the rows of the given year and delete the ones with missing values in the relevant columns
    columns_to_consider = [col for col in df.columns if col not in columns_to_ignore]
    df_year = df_year.dropna(subset=columns_to_consider)
    return df_year

no_null_dfs = [delete_nulls(merged_df, year, columns_to_ignore.get(year)) for year in years] # List comprehension - creates a new list from other lists
merged_df = pandas.concat(no_null_dfs, ignore_index=True)
merged_df.sort_values(['country', 'year'], inplace=True)

# DEBUGGING after subtitution
print('REMOVED APPROPRIATE COUNTRIES - REPLACED MISSING VOTES - DELETED APPROPRIATE MISSING VALUES')
print('TOTAL ROWS:', len(merged_df), '\nTotal missing values for each attribute:\n', merged_df.isna().sum(), '\n')
for year in years:      # Missing values for each year (remember some attributes are not in all years)
    df_year = merged_df[merged_df['year'] == year].reset_index(drop=True)    
    print(year, '- ROWS:', len(df_year), '\nMissing values for each attribute:\n', df_year.isna().sum(), '\n')

merged_df.to_csv('../public/merged_dataset.csv', index=False)