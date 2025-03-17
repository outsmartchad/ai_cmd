import csv
import time
from pathlib import Path

API_URL = 'http://localhost:5005/v1/chat/completions'
USER_TOKEN = 'ROHqapzX0Ccdoyjcy$kbeSUekWc8tur2CN9OMhK32e9FlY1XTujm_sKkVbK8zpf8Gz1g_Bynogs10'
INPUT_FILE = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/combined.csv'
INPUT1_FILE = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/processed/res_cleared_name_pw_concated.csv'
OUTPUT_FILE = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/new_combined.csv'

def write_row_to_csv(row):
    """Append a row to the CSV file"""
    try:
        with open(OUTPUT_FILE, 'a', newline='') as f:
            f.write(row + '\n')
        print(f'Row written to CSV file: {row}')
    except Exception as e:
        print(f'Error writing to CSV file: {e}')

def main():
    raw_data = []
    old_res = {}
    
    # Read first input file
    try:
        with open(INPUT1_FILE, 'r', newline='') as f:
            reader = csv.reader(f)
            for row in reader:
                if row:  # Check if row is not empty
                    value = row[0]
                    quoted_value = f'"{value}"'
                    old_res[value] = True
                    old_res[quoted_value] = True
                else:
                    print(f"Skipping empty row in {INPUT1_FILE}")
    except Exception as e:
        print(f'Error reading CSV file {INPUT1_FILE}: {e}')
    
    # Wait for 3 seconds
    time.sleep(3)
    
    # Read second input file
    try:
        with open(INPUT_FILE, 'r', newline='') as f:
            reader = csv.reader(f)
            for row in reader:
                if row:  # Check if row is not empty
                    value = row[0]
                    print([value])
                    if value in old_res:
                        print(f'{value} Processed already')
                    else:
                        raw_data.append(value)
                else:
                    print(f"Skipping empty row in {INPUT_FILE}")
    except Exception as e:
        print(f'Error reading CSV file {INPUT_FILE}: {e}')
    
    # Wait for 3 seconds
    time.sleep(3)
    print(raw_data)
    raw_data = list(set(raw_data))
    # Write results using csv.writer
    try:
        with open(OUTPUT_FILE, mode='w', newline='') as result_file:
            result_writer = csv.writer(result_file)
            for item in raw_data:
                result_writer.writerow([item])
    except Exception as e:
        print(f'Error writing to output CSV file: {e}')

if __name__ == '__main__':
    main()