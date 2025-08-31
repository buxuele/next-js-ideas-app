import os
import shutil


# 把一个文件夹中所有图片，
# 按照递归的形式，找到所有的图片
# 然后把这些图片移动到目标文件夹中

def merge_imgs(source_dir, target_dir):
    os.makedirs(target_dir, exist_ok=True)

    for root, dirs, files in os.walk(source_dir):
        for file in files:
            source_file = os.path.join(root, file)
            target_file = os.path.join(target_dir, file)

            print("source_file: ", source_file)
            print("target_file: ", target_file)

            shutil.move(source_file, target_file)

    print("done!")

if __name__ == '__main__':
    source_dir = r"F:\Fabmom12"
    target_dir = r"F:\fabmom_001"
    merge_imgs(source_dir, target_dir)
