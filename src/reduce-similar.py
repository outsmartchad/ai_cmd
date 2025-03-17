from sklearn.metrics.pairwise import cosine_similarity
from langchain_ollama import OllamaEmbeddings
import csv

em = "nomic-embed-text"
embed = OllamaEmbeddings(model=em)
csv_path = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/new_combined.csv"
output_csv_path = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/cptc_combined_de_sim.csv"

# Initialize the lists
listI = []
listdata = []

# Prepare to write final results to a CSV file
with open(output_csv_path, mode='w', newline='') as result_file:
    result_writer = csv.writer(result_file)
    result_writer.writerow(["command"])  # Write header
    cnt = 0
    with open(csv_path, "r") as f:
        for i, line in enumerate(f.readlines()):
            print(cnt)
            dataI = line.strip()  # Get the line without trailing newline
            print(dataI)
            print(f"Length: {len(dataI)}")  # Print the length of the line
            
            single_vector = embed.embed_query(dataI)

            if len(listI) != 0:
                ret = cosine_similarity([single_vector], listI)[0]
                ss = sorted(range(len(ret)), key=lambda k: ret[k], reverse=True)
                
                if ret[ss[0]] < 0.8:
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
            cnt+=1
# Final output in result_file will contain the de-similar lines and their lengths