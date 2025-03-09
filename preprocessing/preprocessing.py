import pandas

# Filter columns from 1999-2019 dataset
df1 = pandas.read_csv('../public/dataset_1999.csv')
columns_to_keep1 = ['country', 'year', 'party_id', 'party', 'vote', 'seat', 'epvote', 'family', 'eu_position', 'eu_intmark',
                   'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation', 'redistribution', 'civlib_laworder',
                   'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism', 'urban_rural', 'environment',
                   'regions', 'ethnic_minorities', 'nationalism', 'russian_interference', 'anti_islam_rhetoric']
df1 = df1[columns_to_keep1]
df1.to_csv('../public/dataset_1999_filtered.csv', index=False)

# Filter columns from 2024 dataset and make it coherent to the 1999-2019 dataset
df2 = pandas.read_csv('../public/dataset_2024.csv')
df2['year'] = 2024                                                              # Insert survey year
df2['sociallifestyle'] = (df2['womens_rights'] + df2['lgbtq_rights']) / 2       # sociallifestyle is not defined in 2024 dataset
columns_to_keep2 = ['country',  'year', 'party_id', 'party', 'vote', 'seatperc', 'epvote', 'family', 'eu_position', 'eu_intmark',
                   'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation', 'redistribution', 'civlib_laworder',
                   'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism', 'urban_rural', 'environment',
                   'regions', 'ethnic_minorities', 'nationalism', 'eu_russia', 'anti_islam']
df2 = df2[columns_to_keep2]
df2.rename(columns = {                          # Same names as 1999-2019 dataset
    'seatperc': 'seat',
    'eu_russia': 'russian_interference',
    'anti_islam': 'anti_islam_rhetoric'    
}, inplace=True)
df2['country'] = df2['country'].replace({       # Use numbers like 1999-2019 dataset
    'be': 1,
    'dk': 2,
    'ge': 3,
    'gr': 4,
    'esp': 5,
    'fr': 6,
    'irl': 7,
    'it': 8,
    'nl': 10,
    'uk': 11,
    'por': 12,
    'aus': 13,
    'fin': 14,
    'sv': 16,
    'bul': 20,
    'cz': 21,
    'est': 22,
    'hun': 23,
    'lat': 24,
    'lith': 25,
    'pol': 26,
    'rom': 27,
    'slo': 28,
    'sle': 29,
    'cro': 31,
    'tur': 34,
    'nor': 35,
    'swi': 36,
    'mal': 37,
    'lux': 38,      # Actually not in the 2024 dataset
    'cyp': 40,
    'ice': 45
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

# Merge files
merged_df = pandas.concat([df1, df2], ignore_index=True)
merged_df.sort_values(['country', 'year'], inplace=True)        # Reorder 2024 data
merged_df.to_csv('../public/merged_dataset.csv', index=False)

# RENDERE COERENTI FAMILY
# RIMUOVERE NAZIONI SOLO NEL 2024?
# CAPIRE SE EU_RUSSIA COERENTE
# CAPIRE SE SOCIALLIFESTYLE VA BENE
# COME FUNZIONANO EVENTUALI PARTITI CHE APPAIONO UNA VOLTA (PUNTI)