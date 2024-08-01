window.confirmDelete = async function (receiptId, button) {
  if (confirm('Bạn có chắc chắn muốn xóa Vĩnh Viễn mục này không?')) {
    try {
      const response = await axios.put(
        `https://kitaueno.onrender.com/api/bill/receipt/performDelete/${receiptId}`
      );
      // if (
      //   response.status === 200 &&
      //   response.data.message === 'Receipt deleted successfully'
      // ) {
      //   const listItem = button.closest('li');
      //   const value = parseInt(
      //     listItem
      //       .querySelector('strong:nth-child(2)')
      //       .textContent.split(' ')[1],
      //     10
      //   );
      //   const action = listItem.innerHTML.includes('Thêm Vào Quỹ')
      //     ? 'received'
      //     : 'paid';
      //   total += action === 'received' ? -value : value;
      //   //totalSpan.textContent = total;

      //   listItem.remove();
      //   fetchHistoryReceipts(); // Re-fetch the list after deletion
      // }
      location.reload();
    } catch (error) {
      const errorDiv = document.getElementById('error');
      errorDiv.textContent = `${error}`;
      errorDiv.style.display = 'block';
      console.error('Error deleting receipt:', error);
    }
  }
};
window.confirmRestore = async function (receiptId, button) {
  if (confirm('Bạn có chắc chắn muốn Khôi Phục mục này không?')) {
    try {
      const response = await axios.put(
        `https://kitaueno.onrender.com/api/bill/receipt/reactivate/${receiptId}`
      );
      // if (response.data.status === 'active') {
      //   const listItem = button.closest('li');
      //   const value = parseInt(
      //     listItem
      //       .querySelector('strong:nth-child(2)')
      //       .textContent.split(' ')[1],
      //     10
      //   );
      //   const action = listItem.innerHTML.includes('Thêm Vào Quỹ')
      //     ? 'received'
      //     : 'paid';
      //   total += action === 'received' ? -value : value;
      //   totalSpan.textContent = total;

      //   listItem.remove();
      // }
      fetchHistoryReceipts(); // Re-fetch the list after deletion
    } catch (error) {
      errorDiv.textContent = 'Error deactivating receipt';
      errorDiv.style.display = 'block';
      console.error('Error deactivating receipt:', error);
    }
  }
};
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('receipt-form');
  const errorDiv = document.getElementById('error');
  const totalSpan = document.getElementById('total');
  const receiptList = document.getElementById('receipt-list');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  let total = 0;

  async function fetchHistoryReceipts(query = '', sort = '') {
    try {
      const response = await axios.get(
        'https://kitaueno.onrender.com/api/bill/receipt/deleted_receipts',
        {
          params: {
            query,
            sort,
          },
        }
      );
      receiptList.innerHTML = ''; // Clear the list before adding items
      response.data.forEach((receipt) => {
        addReceiptToList(receipt);
      });
    } catch (error) {
      errorDiv.textContent = 'Error fetching receipts';
      errorDiv.style.display = 'block';
      console.error('Error fetching receipts:', error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const value = parseInt(document.getElementById('value').value, 10);
    const action = document.getElementById('action').value;
    const description = document.getElementById('description').value;
    const spinnerValue = document.getElementById('spinner').value;

    const fullDescription = `${description} - ${spinnerValue}`;

    try {
      const response = await axios.post(
        'https://kitaueno.onrender.com/add-receipt',
        {
          value,
          action,
          description: fullDescription,
          date,
        }
      );
      addReceiptToList(response.data);

      total += action === 'received' ? value : -value;

      form.reset();
    } catch (error) {
      errorDiv.textContent = 'Error adding receipt';
      errorDiv.style.display = 'block';
      console.error('Error adding receipt:', error);
    }
  }

  function addReceiptToList(receipt) {
    const listItem = document.createElement('li');
    listItem.className = `list-group-item ${
      receipt.action === 'received'
        ? 'list-group-item-success'
        : 'list-group-item-warning'
    } d-flex justify-content-between align-items-center`;
    listItem.dataset.id = receipt._id;
    listItem.innerHTML = `
          <div>
            <strong>Ngày:</strong> ${moment(receipt.date).format(
              'DD/MM/YYYY'
            )} <br />
            <strong>Tổng:</strong> ${
              receipt.action === 'received' ? 'Thêm Vào Quỹ ' : 'Mua '
            } ${receipt.value} ￥<br />
            <strong>Ghi chú:</strong> ${receipt.description}<br />
            <strong>Cập nhật lần cuối:</strong> ${receipt.modifiedDate}
          </div>
          <button class="btn btn-success btn-sm ms-1" onclick="confirmRestore('${
            receipt._id
          }', this)">Khôi phục</button>
          <button class="btn btn-danger btn-sm ms-1" onclick="confirmDelete('${
            receipt._id
          }', this)">Xóa</button>
        `;
    receiptList.prepend(listItem);
  }

  // Search functionality
  searchInput.addEventListener('input', function () {
    fetchHistoryReceipts(searchInput.value, sortSelect.value);
  });

  // Sort functionality
  sortSelect.addEventListener('change', function () {
    fetchHistoryReceipts(searchInput.value, sortSelect.value);
  });

  await fetchHistoryReceipts();
});
