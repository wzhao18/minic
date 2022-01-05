#include <iostream>

int main() {
    int i, space, rows = 10, k = 0, count = 0, count1 = 0;
    for (i = 1; i <= rows; ++i) {
        for (space = 1; space <= rows - i; ++space) {
            std::cout << "  ";
            ++count;
        }
        while (k != 2 * i - 1) {
            if (count <= rows - 1) {
                std::cout << (i + k) << " ";
                ++count;
            } else {
                ++count1;
                std::cout << (i + k - 2 * count1) << " ";
            }
            ++k;
        }
        count1 = count = k = 0;
        std::cout << std::endl;
    }
    return 0;
}