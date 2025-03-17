from sklearn.neighbors import KDTree
from langchain_ollama import OllamaEmbeddings
import csv
import numpy as np

em = "nomic-embed-text"
embed = OllamaEmbeddings(model=em)
csv_path = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/new_combined.csv"
output_csv_path = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/cptc_combined_de_sim_kdtree.csv"

# Initialize the lists
listI = []  # For embeddings
listdata = []  # For original data

# Prepare to write final results to a CSV file
with open(output_csv_path, mode='w', newline='') as result_file:
    result_writer = csv.writer(result_file)
    result_writer.writerow(["command"])  # Write header
    cnt = 0
    
    # Build KDTree incrementally
    with open(csv_path, "r") as f:
        for i, line in enumerate(f.readlines()):
            print(cnt)
            dataI = line.strip()  # Get the line without trailing newline
            print(dataI)
            print(f"Length: {len(dataI)}")  # Print the length of the line
            
            # Get embedding and normalize it (for cosine similarity approximation)
            single_vector = embed.embed_query(dataI)
            single_vector = np.array(single_vector) / np.linalg.norm(single_vector)  # Normalize

            if len(listI) != 0:
                # Convert listI to numpy array for KDTree if not already done
                listI_array = np.array(listI)
                
                # Create KDTree with existing vectors
                kdtree = KDTree(listI_array, metric='euclidean')  # Euclidean on normalized vectors ~ cosine
                
                # Query the KDTree for the nearest neighbor
                dist, ind = kdtree.query([single_vector], k=1)  # k=1 for nearest neighbor
                max_similarity = 1 - (dist[0][0]**2) / 2  # Convert Euclidean distance to cosine similarity
                
                # Threshold check (similar to your 0.8 threshold)
                if max_similarity < 0.8:
                    print(f"Adding to results: {dataI} (Length: {len(dataI)})")
                    listI.append(single_vector)
                    listdata.append(dataI)
                    result_writer.writerow([dataI])  # Write to results CSV
            else:
                # First entry case
                print(f"Adding first entry: {dataI} (Length: {len(dataI)})")
                listI.append(single_vector)
                listdata.append(dataI)
                result_writer.writerow([dataI])  # Write to results CSV
            cnt += 1

# Final output in result_file will contain the de-similar lines